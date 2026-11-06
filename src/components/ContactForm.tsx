import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, CheckCircle2, Info, LoaderCircle } from 'lucide-react'
import { profile } from '../data/content'

type Status = 'checking' | 'ready' | 'unavailable'
export function ContactForm() {
  const [status, setStatus] = useState<Status>('checking')
  const [sending, setSending] = useState(false)
  const [messageLength, setMessageLength] = useState(0)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const inFlight = useRef(false)
  const submission = useRef({ payload: '', id: '' })
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    fetch('/api/contact', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error()
        return response.json()
      })
      .then((data) =>
        setStatus(data.configured === true ? 'ready' : 'unavailable'),
      )
      .catch(() => {
        if (!controller.signal.aborted) setStatus('unavailable')
      })
      .finally(() => window.clearTimeout(timeout))
    const fallback = window.setTimeout(
      () =>
        setStatus((current) =>
          current === 'checking' ? 'unavailable' : current,
        ),
      8100,
    )
    return () => {
      controller.abort()
      window.clearTimeout(timeout)
      window.clearTimeout(fallback)
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      subject: String(formData.get('subject') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
      website: String(formData.get('website') ?? ''),
    }
    if (status !== 'ready') {
      setFeedback({
        type: 'error',
        message:
          'The contact form is not available. Your message has not been sent. Please use the email link below.',
      })
      return
    }
    if (!payload.name || !payload.subject || payload.message.length < 10) {
      setFeedback({
        type: 'error',
        message:
          'Please fill in your name, subject, and a message of at least 10 characters.',
      })
      return
    }
    const serialized = JSON.stringify(payload)
    if (serialized !== submission.current.payload)
      submission.current = { payload: serialized, id: crypto.randomUUID() }
    inFlight.current = true
    setSending(true)
    setFeedback(null)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          submissionId: submission.current.id,
        }),
        signal: AbortSignal.timeout(15000),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.success !== true)
        throw new Error(
          result?.error ??
            'The message could not be sent. Please try again or use email.',
        )
      setFeedback({
        type: 'success',
        message:
          'Your message was accepted by the email service. Thanks for reaching out!',
      })
      form.reset()
      setMessageLength(0)
      submission.current = { payload: '', id: '' }
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error && error.name !== 'TimeoutError'
            ? error.message
            : 'The request timed out. Delivery could not be confirmed. Please retry or use email.',
      })
    } finally {
      inFlight.current = false
      setSending(false)
    }
  }

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      aria-labelledby="contact-form-heading"
      aria-busy={sending}
    >
      <h3 id="contact-form-heading">Leave a note.</h3>
      {status !== 'ready' && (
        <div className="form-notice" role="status">
          <Info size={15} />
          <span>
            {status === 'checking' ? (
              'Checking form availability…'
            ) : (
              <>
                The form isn’t accepting messages yet. You can reach me directly
                by <a href={`mailto:${profile.email}`}>email</a>.
              </>
            )}
          </span>
        </div>
      )}
      <fieldset disabled={sending} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="honeypot">Your contact details and message</legend>
        <div className="field-row">
          <div className="form-field">
            <label htmlFor="contact-name">Your name</label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Alex Smith"
            />
          </div>
          <div className="form-field">
            <label htmlFor="contact-email">Email address</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="alex@company.com"
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="contact-subject">Subject</label>
          <input
            id="contact-subject"
            name="subject"
            required
            minLength={2}
            maxLength={150}
            placeholder="An internship opportunity, perhaps?"
          />
        </div>
        <div className="form-field">
          <label htmlFor="contact-message">Your message</label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={5000}
            placeholder="Tell me a little about what you have in mind…"
            rows={5}
            onChange={(event) => setMessageLength(event.target.value.length)}
            aria-describedby="message-length"
          />
          <span className="character-count" id="message-length">
            {messageLength.toLocaleString()} / 5,000
          </span>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="contact-website">Leave this field empty</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="button primary"
          disabled={sending || status !== 'ready'}
        >
          {sending
            ? 'Sending your message…'
            : status === 'ready'
              ? 'Send message'
              : 'Sending is not configured'}
          {sending ? (
            <LoaderCircle className="spinner" size={17} />
          ) : (
            <ArrowUpRight size={17} />
          )}
        </button>
      </fieldset>
      {feedback && (
        <div
          ref={feedbackRef}
          className={`form-feedback ${feedback.type}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.type === 'success' && <CheckCircle2 size={16} />}
          {feedback.message}
          {feedback.type === 'error' && (
            <>
              {' '}
              <a href={`mailto:${profile.email}`}>Email Gio directly</a>.
            </>
          )}
        </div>
      )}
      <p className="form-privacy">
        Your details are used only to respond to your message. Prefer your own
        inbox?{' '}
        <a className="text-link" href={`mailto:${profile.email}`}>
          Send an email <ArrowUpRight size={12} />
        </a>
      </p>
    </form>
  )
}
