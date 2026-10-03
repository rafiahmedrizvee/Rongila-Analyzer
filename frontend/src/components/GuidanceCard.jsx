import { motion } from 'framer-motion'
import { Sun, Moon, ShieldCheck, Hand, Info } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function GuidanceCard({ guidance }) {
  if (!guidance) return null

  const hasHandCare = guidance.hand_care?.length > 0
  const hasNotes = guidance.notes?.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="rounded-lg border border-line/70 bg-white/50 p-7"
    >
      <h3 className="font-display text-2xl tracking-tight">Recommended routine</h3>
      <p className="mt-2 max-w-prose text-sm text-ink-soft">
        General educational guidance, not a dermatology prescription. Adjust based on how your skin responds.
      </p>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-7 grid gap-8 sm:grid-cols-3"
      >
        <RoutineColumn icon={Sun} title="Morning" items={guidance.morning} />
        <RoutineColumn icon={Moon} title="Evening" items={guidance.evening} />
        <RoutineColumn icon={ShieldCheck} title="Sun protection" items={guidance.sun_protection} />
      </motion.div>

      {hasHandCare && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-8 rounded-md border border-line/70 bg-paper-dim p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-ink">
            <Hand size={16} className="text-accent-dark" />
            <h4 className="text-sm font-medium">Hand-specific care</h4>
          </div>
          <p className="mb-3 text-xs text-ink-soft">
            This result came from a hand photo — hand skin faces different everyday stress than facial skin.
          </p>
          <ul className="space-y-2 text-sm text-ink-soft">
            {guidance.hand_care.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent-dark" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {hasNotes && (
        <div className="mt-6 space-y-2">
          {guidance.notes.map((note) => (
            <div key={note} className="flex gap-2 rounded-md bg-accent-tint px-4 py-3 text-xs leading-relaxed text-accent-dark">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function RoutineColumn({ icon: Icon, title, items }) {
  return (
    <motion.div variants={item}>
      <div className="mb-3 flex items-center gap-2 text-ink">
        <Icon size={16} className="text-accent-dark" />
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      <ol className="space-y-2 text-sm text-ink-soft">
        {items.map((entry, i) => (
          <li key={entry} className="flex gap-2">
            <span className="text-accent-dark">{i + 1}.</span>
            <span>{entry}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}
