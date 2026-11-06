import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  createContactHandler,
  isConfigured,
  validatePayload,
} from '../server/contact.ts'

const environment = {
  RESEND_API_KEY: 'test-key-not-real',
  CONTACT_FROM_EMAIL: 'portfolio@example.com',
  CONTACT_TO_EMAIL: 'lopezjgm999@gmail.com',
}
const valid = {
  name: 'Alex Smith',
  email: 'alex@example.com',
  subject: 'Internship opportunity',
  message: 'Hello Gio, we would like to discuss an internship.',
  website: '',
  submissionId: 'b62a87d4-89be-41f6-8d63-e51b1f19a5bd',
}
type Handler = ReturnType<typeof createContactHandler>
async function invoke(
  handler: Handler,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    raw?: string
  } = {},
) {
  const request = Readable.from(
    options.raw ? [options.raw] : [],
  ) as unknown as IncomingMessage & { body?: unknown }
  request.method = options.method ?? 'POST'
  request.headers = {
    host: 'localhost:5173',
    'content-type': 'application/json',
    ...options.headers,
  }
  Object.defineProperty(request, 'socket', {
    value: { remoteAddress: '127.0.0.1' },
  })
  if (options.raw === undefined) request.body = options.body ?? valid
  const headers: Record<string, unknown> = {}
  let output = ''
  const response = {
    statusCode: 200,
    setHeader: (name: string, value: unknown) => {
      headers[name] = value
    },
    end: (text: string) => {
      output = text
    },
  }
  await handler(request, response as unknown as ServerResponse)
  return { status: response.statusCode, body: JSON.parse(output), headers }
}
const forbiddenFetch = (async () => {
  throw new Error('Unexpected external call')
}) as typeof fetch
const acceptedFetch = (async () =>
  Response.json({ id: 'test-email-id' })) as typeof fetch

test('configuration rejects missing keys, consumer senders, and incomplete rate-limit configuration', () => {
  assert.equal(isConfigured({}), false)
  assert.equal(isConfigured(environment), true)
  for (const domain of ['gmail.com', 'outlook.com', 'resend.dev'])
    assert.equal(
      isConfigured({ ...environment, CONTACT_FROM_EMAIL: `sender@${domain}` }),
      false,
    )
  assert.equal(
    isConfigured({
      ...environment,
      UPSTASH_REDIS_REST_URL: 'https://example.com',
    }),
    false,
  )
})
test('GET exposes only configuration state and never sends an email', async () => {
  const result = await invoke(
    createContactHandler(environment, forbiddenFetch),
    { method: 'GET' },
  )
  assert.deepEqual(result.body, { configured: true })
  assert.equal(result.headers['Cache-Control'], 'no-store')
})
test('missing configuration fails honestly without calling Resend', async () => {
  const result = await invoke(createContactHandler({}, forbiddenFetch))
  assert.equal(result.status, 503)
  assert.equal(result.body.success, undefined)
})
test('unsupported methods are rejected', async () => {
  const result = await invoke(
    createContactHandler(environment, forbiddenFetch),
    { method: 'PUT' },
  )
  assert.equal(result.status, 405)
  assert.equal(result.headers.Allow, 'GET, POST')
})
test('invalid, incomplete, short, and oversized fields are rejected', () => {
  for (const input of [
    null,
    [],
    {},
    { ...valid, email: 'bad' },
    { ...valid, name: 'A' },
    { ...valid, message: 'short' },
    { ...valid, subject: 'x'.repeat(151) },
    { ...valid, message: 'x'.repeat(5001) },
    { ...valid, submissionId: 'invalid' },
  ])
    assert.throws(() => validatePayload(input))
})
test('honeypot and email header injection are rejected', () => {
  assert.throws(() => validatePayload({ ...valid, website: 'spam.example' }))
  assert.throws(() =>
    validatePayload({ ...valid, name: 'Alex\r\nBcc: evil@example.com' }),
  )
  assert.throws(() =>
    validatePayload({
      ...valid,
      email: 'alex@example.com\r\n' + 'Bcc: evil@example.com',
    }),
  )
})
test('JSON and raw byte limits apply independently of declared content length', async () => {
  const handler = createContactHandler(environment, forbiddenFetch)
  assert.equal(
    (await invoke(handler, { body: { ...valid, message: 'é'.repeat(7000) } }))
      .status,
    413,
  )
  assert.equal((await invoke(handler, { raw: 'x'.repeat(12001) })).status, 413)
  assert.equal(
    (await invoke(handler, { headers: { 'content-length': '12001' } })).status,
    413,
  )
})
test('malformed JSON and incorrect content types are rejected', async () => {
  const handler = createContactHandler(environment, forbiddenFetch)
  assert.equal((await invoke(handler, { raw: '{bad' })).status, 400)
  assert.equal(
    (await invoke(handler, { headers: { 'content-type': 'text/plain' } }))
      .status,
    415,
  )
  assert.equal(
    (
      await invoke(handler, {
        headers: { 'content-type': 'application/json-junk' },
      })
    ).status,
    415,
  )
})
test('cross-origin requests fail while matching origins are accepted', async () => {
  const handler = createContactHandler(environment, acceptedFetch)
  assert.equal(
    (await invoke(handler, { headers: { origin: 'https://evil.example' } }))
      .status,
    403,
  )
  assert.equal(
    (await invoke(handler, { headers: { origin: 'http://localhost:5173' } }))
      .status,
    200,
  )
})
test('configured sender and reply-to are correct; visitor markup stays plain text', async () => {
  let sent: Record<string, unknown> = {}
  const handler = createContactHandler(environment, (async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails')
    sent = JSON.parse(String(init?.body))
    return Response.json({ id: 'accepted' })
  }) as typeof fetch)
  assert.equal(
    (
      await invoke(handler, {
        body: { ...valid, message: '<script>alert(1)</script> Hello there.' },
      })
    ).status,
    200,
  )
  assert.equal(sent.from, environment.CONTACT_FROM_EMAIL)
  assert.deepEqual(sent.to, [environment.CONTACT_TO_EMAIL])
  assert.equal(sent.reply_to, valid.email)
  assert.equal(sent.html, undefined)
  assert.match(String(sent.text), /<script>/)
})
test('retries use a stable Resend idempotency key and changed messages use a new key', async () => {
  const keys: string[] = []
  const handler = createContactHandler(environment, (async (_url, init) => {
    keys.push(new Headers(init?.headers).get('Idempotency-Key')!)
    return Response.json({ id: 'accepted' })
  }) as typeof fetch)
  await invoke(handler)
  await invoke(handler)
  await invoke(handler, {
    body: {
      ...valid,
      message: 'This is a different message from the same visitor.',
    },
  })
  assert.equal(keys[0], keys[1])
  assert.notEqual(keys[0], keys[2])
})
test('provider errors, missing acceptance IDs, and timeouts never return success', async () => {
  for (const mock of [
    async () => Response.json({ message: 'rejected' }, { status: 403 }),
    async () => Response.json({}),
    async () => {
      throw new Error('timeout')
    },
  ]) {
    const result = await invoke(
      createContactHandler(environment, mock as typeof fetch),
    )
    assert.ok(result.status >= 500)
    assert.equal(result.body.success, undefined)
    assert.doesNotMatch(JSON.stringify(result.body), /test-key-not-real/)
  }
})
test('local limiter rejects the sixth request and returns Retry-After', async () => {
  const handler = createContactHandler(environment, acceptedFetch)
  for (let i = 0; i < 5; i++) assert.equal((await invoke(handler)).status, 200)
  const result = await invoke(handler)
  assert.equal(result.status, 429)
  assert.ok(Number(result.headers['Retry-After']) > 0)
})
test('persistent limiter uses an atomic expiring Redis counter and blocks above the limit', async () => {
  const handler = createContactHandler(
    {
      ...environment,
      UPSTASH_REDIS_REST_URL: 'https://redis.example.com',
      UPSTASH_REDIS_REST_TOKEN: 'redis-test',
    },
    (async (url, init) => {
      assert.equal(url, 'https://redis.example.com')
      const command = JSON.parse(String(init?.body))
      assert.equal(command[0], 'EVAL')
      assert.match(command[1], /EXPIRE/)
      assert.doesNotMatch(command[3], /127\.0\.0\.1/)
      return Response.json({ result: [6, 590] })
    }) as typeof fetch,
  )
  const result = await invoke(handler)
  assert.equal(result.status, 429)
  assert.equal(result.headers['Retry-After'], 590)
})
test('persistent limiter fails closed on service failures and malformed responses', async () => {
  for (const output of [
    { result: [null, 500] },
    { error: 'unavailable' },
    { result: [1, -1] },
  ]) {
    const handler = createContactHandler(
      {
        ...environment,
        UPSTASH_REDIS_REST_URL: 'https://redis.example.com',
        UPSTASH_REDIS_REST_TOKEN: 'redis-test',
      },
      (async () => Response.json(output)) as typeof fetch,
    )
    const result = await invoke(handler)
    assert.equal(result.status, 503)
    assert.equal(result.body.success, undefined)
  }
})
