import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import GuidanceCard from '../components/GuidanceCard.jsx'
import Button from '../components/Button.jsx'
import { SKIN_TONE_CLASSES, GUIDANCE_BY_CLASS } from '../utils/helpers.js'

export default function Guide() {
  return (
    <div className="container-page max-w-4xl py-16">
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Skin care guide</h1>
      <p className="mt-3 max-w-prose text-ink-soft">
        General educational guidance for each tone class on the scale. This is not a substitute
        for advice from a dermatologist, and it does not account for skin type, allergies, or
        existing conditions.
      </p>

      <div className="mt-10 space-y-6">
        {SKIN_TONE_CLASSES.map((cls) => (
          <details
            key={cls.id}
            className="group overflow-hidden rounded-lg border border-line/70 bg-white/40"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 p-6">
              <span className="h-8 w-8 shrink-0 rounded-md" style={{ backgroundColor: cls.swatch }} aria-hidden />
              <div>
                <p className="font-medium text-ink">{cls.label}</p>
                <p className="text-xs text-ink-soft">{cls.note}</p>
              </div>
            </summary>
            <div className="border-t border-line/70 p-6 pt-4">
              <GuidanceCard guidance={GUIDANCE_BY_CLASS[cls.id]} />
            </div>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-line/70 bg-paper-dim p-7">
        <h2 className="font-medium text-ink">A note on skin type</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
          Skin tone and skin type are different things. Tone is how light or dark skin appears;
          type is whether skin runs oily, dry, combination, or sensitive. This guide only reflects
          tone — pair it with your own sense of your skin type, or a short questionnaire, for a
          fuller routine.
        </p>
      </div>

      <Button as={Link} to="/analyze" variant="accent" size="lg" className="mt-10" icon={ArrowRight} iconPosition="right">
        Find your tone
      </Button>
    </div>
  )
}
