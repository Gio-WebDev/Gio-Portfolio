import { createHash, createHmac } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

type Environment = Record<string, string | undefined>
type ContactRequest = IncomingMessage & { body?: unknown }
interface Payload {
  name: string
  email: string
  subject: string
  message: string
  website: string
  submissionId: string
}
interface RateResult {
  allowed: boolean
  retryAfter: number
}
const MAX_BYTES = 12_000
const WINDOW_SECONDS = 600
const MAX_REQUESTS = 5
const emailPattern = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const singleLine = (value: string) =>
  Array.from(value).every(
    (character) =>
      character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127,
  )

class RequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function isConfigured(env: Environment): boolean {
  const sender = env.CONTACT_FROM_EMAIL?.trim() ?? ''
  const recipient = env.CONTACT_TO_EMAIL?.trim() ?? ''
  const senderDomain = sender.split('@')[1]?.toLowerCase()
  return Boolean(
    env.RESEND_API_KEY?.trim() &&
    emailPattern.test(sender) &&
    emailPattern.test(recipient) &&
    singleLine(sender) &&
    singleLine(recipient) &&
    ![
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'resend.dev',
    ].includes(senderDomain) &&
    Boolean(env.UPSTASH_REDIS_REST_URL) ===
      Boolean(env.UPSTASH_REDIS_REST_TOKEN),
  )
}

async function readBody(request: ContactRequest): Promise<unknown> {
  const claimedLength = Number(request.headers['content-length'] ?? 0)
  if (!Number.isFinite(claimedLength) || claimedLength > MAX_BYTES)
    throw new RequestError(
      413,
      'Your message is too large. Please shorten it or send an email.',
    )
  if (
    request.headers['content-type']?.split(';')[0].trim().toLowerCase() !==
    'application/json'
  )
    throw new RequestError(415, 'Please send the form as JSON.')
  if (request.body !== undefined) {
    const serialized =
      typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body)
    if (Buffer.byteLength(serialized ?? '', 'utf8') > MAX_BYTES)
      throw new RequestError(413, 'Your message is too large.')
    try {
      return typeof request.body === 'string'
        ? JSON.parse(request.body)
        : request.body
    } catch {
      throw new RequestError(400, 'The message could not be read.')
    }
  }
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BYTES)
      throw new RequestError(413, 'Your message is too large.')
    chunks.push(buffer)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new RequestError(400, 'The message could not be read.')
  }
}

export function validatePayload(input: unknown): Payload {
  if (typeof input !== 'object' || input === null || Array.isArray(input))
    throw new RequestError(400, 'Please complete the contact form.')
  const data = input as Record<string, unknown>
  const limits: Record<string, [number, number]> = {
    name: [2, 100],
    email: [3, 254],
    subject: [2, 150],
    message: [10, 5000],
    submissionId: [36, 36],
  }
  const result: Record<string, string> = {}
  for (const [key, [minimum, maximum]] of Object.entries(limits)) {
    if (typeof data[key] !== 'string')
      throw new RequestError(
        400,
        `Please provide a valid ${key === 'submissionId' ? 'submission' : key}.`,
      )
    const value = data[key].trim()
    if (value.length < minimum || value.length > maximum)
      throw new RequestError(
        400,
        `Please check the length of your ${key === 'submissionId' ? 'submission' : key}.`,
      )
    result[key] = value
  }
  if (!emailPattern.test(result.email) || !singleLine(result.email))
    throw new RequestError(400, 'Please provide a valid email address.')
  if (
    !singleLine(result.name) ||
    !singleLine(result.subject) ||
    Array.from(result.message).some((character) =>
      [0, 8, 27].includes(character.charCodeAt(0)),
    )
  )
    throw new RequestError(
      400,
      'Please remove unsupported characters from your message.',
    )
  if (!uuidPattern.test(result.submissionId))
    throw new RequestError(400, 'Please refresh the page and try again.')
  if (data.website !== undefined && typeof data.website !== 'string')
    throw new RequestError(400, 'The message could not be submitted.')
  result.website = (data.website as string | undefined)?.trim() ?? ''
  if (result.website)
    throw new RequestError(
      400,
      'The message could not be submitted. Please use the email link.',
    )
  return result as unknown as Payload
}

function assertOrigin(request: ContactRequest, env: Environment) {
  const origin = request.headers.origin
  if (!origin) return
  try {
    const parsed = new URL(origin)
    const expectedHost = request.headers.host
    if (
      env.CONTACT_ALLOWED_ORIGIN
        ? parsed.origin !== new URL(env.CONTACT_ALLOWED_ORIGIN).origin
        : parsed.host !== expectedHost
    )
      throw new Error()
  } catch {
    throw new RequestError(
      403,
      'This request is not allowed. Please use the portfolio contact form.',
    )
  }
}

export function createContactHandler(
  env: Environment = process.env,
  fetcher: typeof fetch = fetch,
) {
  // A local fallback only. Persistent Upstash counters are used whenever configured.
  const memory = new Map<string, { count: number; reset: number }>()
  async function limit(request: ContactRequest): Promise<RateResult> {
    // Vercel overwrites x-forwarded-for with the public client IP. Local proxying is not a trust boundary.
    const forwarded = request.headers['x-forwarded-for']
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded)
        ?.split(',')[0]
        .trim() ||
      request.socket.remoteAddress ||
      'unknown'
    const hash = createHmac(
      'sha256',
      env.RESEND_API_KEY ?? 'local-unconfigured',
    )
      .update(ip)
      .digest('hex')
    const now = Date.now()
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      // Increment and set the expiry atomically so interrupted invocations cannot leave permanent counters.
      const script =
        "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return {n, redis.call('TTL', KEYS[1])}"
      const response = await fetcher(env.UPSTASH_REDIS_REST_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          'EVAL',
          script,
          '1',
          `gio:contact:${hash}`,
          String(WINDOW_SECONDS),
        ]),
        signal: AbortSignal.timeout(4000),
      })
      const result = (await response.json()) as {
        result?: unknown
        error?: string
      }
      if (
        !response.ok ||
        result.error ||
        !Array.isArray(result.result) ||
        result.result.length !== 2
      )
        throw new RequestError(
          503,
          'The contact form is temporarily unavailable. Please email Gio directly.',
        )
      const [count, ttl] = result.result
      if (
        typeof count !== 'number' ||
        !Number.isFinite(count) ||
        count < 1 ||
        typeof ttl !== 'number' ||
        !Number.isFinite(ttl) ||
        ttl < 0
      )
        throw new RequestError(
          503,
          'The contact form is temporarily unavailable. Please email Gio directly.',
        )
      return { allowed: count <= MAX_REQUESTS, retryAfter: Math.max(1, ttl) }
    }
    for (const [key, value] of memory)
      if (value.reset <= now) memory.delete(key)
    if (!memory.has(hash)) {
      if (memory.size >= 5000)
        throw new RequestError(
          503,
          'The contact form is busy. Please use email.',
        )
      memory.set(hash, { count: 0, reset: now + WINDOW_SECONDS * 1000 })
    }
    const entry = memory.get(hash)!
    entry.count += 1
    return {
      allowed: entry.count <= MAX_REQUESTS,
      retryAfter: Math.max(1, Math.ceil((entry.reset - now) / 1000)),
    }
  }

  return async function handler(
    request: ContactRequest,
    response: ServerResponse,
  ) {
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    const json = (status: number, data: unknown) => {
      response.statusCode = status
      response.end(JSON.stringify(data))
    }
    if (request.method === 'GET') {
      json(200, { configured: isConfigured(env) })
      return
    }
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST')
      json(405, { error: 'Method not allowed.' })
      return
    }
    try {
      assertOrigin(request, env)
      const input = await readBody(request)
      const payload = validatePayload(input)
      if (!isConfigured(env))
        throw new RequestError(
          503,
          'Email sending is not configured yet. Your message has not been sent. Please email lopezjgm999@gmail.com directly.',
        )
      const rate = await limit(request)
      if (!rate.allowed) {
        response.setHeader('Retry-After', rate.retryAfter)
        throw new RequestError(
          429,
          'Too many messages. Please try again in a few minutes or email Gio directly.',
        )
      }
      const { name, email, subject, message, submissionId } = payload
      // Include the normalized payload so a modified message is a new send even if a client reuses an ID.
      const key = createHash('sha256')
        .update(JSON.stringify([submissionId, name, email, subject, message]))
        .digest('hex')
      const result = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `gio-contact-${key}`,
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL!.trim(),
          to: [env.CONTACT_TO_EMAIL!.trim()],
          reply_to: email,
          subject: `Portfolio enquiry: ${subject}`,
          // Plain text avoids HTML/script injection and keeps visitor content out of email markup.
          text: `New portfolio enquiry\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
        }),
        signal: AbortSignal.timeout(10000),
      })
      const outcome = (await result.json().catch(() => null)) as {
        id?: string
      } | null
      if (!result.ok || typeof outcome?.id !== 'string' || !outcome.id)
        throw new RequestError(
          502,
          'The email service could not accept your message. Please retry or email Gio directly.',
        )
      json(200, { success: true })
    } catch (error) {
      if (error instanceof RequestError)
        json(error.status, { error: error.message })
      else
        json(503, {
          error:
            'Delivery could not be confirmed. Please retry or email Gio directly.',
        })
    }
  }
}
