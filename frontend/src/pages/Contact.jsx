import { useState } from 'react'
import { Send } from 'lucide-react'
import Button from '../components/Button.jsx'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Phase 1: no backend endpoint yet — this just confirms the form works.
    setSent(true)
  }

  return (
    <div className="container-page max-w-xl py-16">
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Contact</h1>
      <p className="mt-3 text-ink-soft">
        Questions about the project, the methodology, or the dataset? Send a note.
      </p>

      {sent ? (
        <div className="mt-8 rounded-md bg-accent-tint px-5 py-4 text-sm text-accent-dark">
          Thanks — your message has been noted. This form doesn't send anywhere yet in this build.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Name" id="name" type="text" required />
          <Field label="Email" id="email" type="email" required />
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm text-ink-soft">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              className="w-full rounded-md border border-line/70 bg-white/50 px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <Button type="submit" variant="accent" icon={Send} iconPosition="right">
            Send message
          </Button>
        </form>
      )}
    </div>
  )
}

function Field({ label, id, type, required }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        className="w-full rounded-md border border-line/70 bg-white/50 px-4 py-3 text-sm outline-none focus:border-accent"
      />
    </div>
  )
}
