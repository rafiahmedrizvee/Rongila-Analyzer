import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { SKIN_TONE_CLASSES } from '../utils/helpers.js'

export default function ResultCard({ result, imageSrc }) {
  const cls = SKIN_TONE_CLASSES.find((c) => c.id === result.skin_tone_id)
  const confidencePct = Math.round(result.confidence * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="overflow-hidden rounded-lg border border-line/70 bg-white/50"
    >
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="relative">
          {imageSrc ? (
            <img src={imageSrc} alt="Analyzed" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center bg-paper-dim text-sm text-ink-soft">
              No image available
            </div>
          )}
        </div>

        <div className="p-7">
          <p className="text-sm text-ink-soft">Skin tone</p>
          <div className="mt-1 flex items-center gap-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
              className="h-8 w-8 rounded-md"
              style={{ backgroundColor: cls?.swatch || '#ccc' }}
              aria-hidden
            />
            <h2 className="font-display text-3xl tracking-tight">{result.skin_tone}</h2>
          </div>

          <p className="mt-6 text-sm text-ink-soft">Confidence</p>
          <p className="mt-1 text-2xl font-medium text-accent-dark">{confidencePct}%</p>
          <div className="mt-2 h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-paper-dim">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidencePct}%` }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-accent"
            />
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            This reflects the model's estimated probability, not a guarantee of correctness.
          </p>

          <ul className="mt-6 space-y-2 border-t border-line/70 pt-5 text-sm">
            <CheckItem ok={result.face_detected} label="Face detected" delay={0.25} />
            <CheckItem ok={result.skin_region_detected} label="Skin region detected" delay={0.32} />
            <CheckItem ok label="Image quality acceptable" delay={0.39} />
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

function CheckItem({ ok, label, delay = 0 }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-2 text-ink-soft"
    >
      <CheckCircle2 size={16} className={ok ? 'text-accent' : 'text-line'} />
      <span>{label}</span>
    </motion.li>
  )
}
