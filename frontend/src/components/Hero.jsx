import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Camera } from 'lucide-react'
import { SKIN_TONE_CLASSES } from '../utils/helpers.js'
import Button from './Button.jsx'

export default function Hero() {
  return (
    <section className="container-page grid gap-12 pb-20 pt-14 md:grid-cols-2 md:items-center md:pt-20">
      <div>
        <p className="mb-5 text-sm text-accent-dark">Computer vision · Skincare guidance</p>
        <h1 className="font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Skin Tone Analyzer
        </h1>
        <p className="mt-4 max-w-prose text-xl leading-snug text-ink-soft">
          See where your skin falls on the tone scale, then know how to care for it.
        </p>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
          Upload a photo or use your camera. A trained model detects your face, reads the
          visible skin tone, and hands back a routine built for it — nothing more.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Button as={Link} to="/analyze" variant="accent" size="lg" icon={ArrowRight} iconPosition="right">
            Analyze your skin tone
          </Button>
          <Button as="a" href="#how-it-works" variant="outline" size="lg" icon={Camera}>
            How it works
          </Button>
        </div>
        <p className="mt-6 text-xs text-ink-soft">
          Educational estimate only — not a medical diagnosis.
        </p>
      </div>

      <div className="rounded-xl border border-line/70 bg-white/50 p-8 shadow-soft">
        <p className="mb-6 text-sm text-ink-soft">The eight-point tone scale this project classifies against</p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {SKIN_TONE_CLASSES.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: 'easeOut' }}
              className="flex flex-col items-center gap-2"
            >
              <span
                className="h-12 w-full rounded-md sm:h-16"
                style={{ backgroundColor: cls.swatch }}
                aria-hidden
              />
              <span className="text-center text-[11px] leading-tight text-ink-soft">{cls.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-7 flex items-center justify-between rounded-md bg-accent-tint px-4 py-3 text-sm text-accent-dark">
          <span>Sample classification</span>
          <span className="font-medium">Medium · 91% confidence</span>
        </div>
      </div>
    </section>
  )
}
