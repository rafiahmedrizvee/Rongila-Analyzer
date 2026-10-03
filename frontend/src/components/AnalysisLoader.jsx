import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STEPS = [
  'Uploading image',
  'Detecting face',
  'Scanning skin region',
  'Normalizing image',
  'Analyzing skin tone',
  'Generating guidance',
  'Complete',
]

export default function AnalysisLoader({ progress = 0 }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const stepCount = STEPS.length
    const index = Math.min(stepCount - 1, Math.floor((progress / 100) * (stepCount - 1)))
    setActiveIndex(index)
  }, [progress])

  return (
    <div className="mx-auto max-w-md rounded-lg border border-line/70 bg-white/50 p-8">
      <p className="mb-6 text-center text-sm text-ink-soft">Analyzing your photo</p>
      <ul className="space-y-4">
        {STEPS.map((step, i) => {
          const done = i < activeIndex
          const active = i === activeIndex
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  done
                    ? 'bg-accent text-paper'
                    : active
                      ? 'bg-accent-tint text-accent-dark'
                      : 'bg-paper-dim text-ink-soft'
                }`}
              >
                {done ? <Check size={13} /> : i + 1}
              </span>
              <span className={`text-sm ${active ? 'font-medium text-ink' : 'text-ink-soft'}`}>{step}</span>
              {active && (
                <motion.span
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                />
              )}
            </li>
          )
        })}
      </ul>
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-paper-dim">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>
    </div>
  )
}
