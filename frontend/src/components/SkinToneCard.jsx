import { motion } from 'framer-motion'

const card = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function SkinToneCard({ cls }) {
  return (
    <motion.div
      variants={card}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="overflow-hidden rounded-lg border border-line/70 bg-white/40"
    >
      <div className="h-20" style={{ backgroundColor: cls.swatch }} aria-hidden />
      <div className="p-4">
        <h3 className="font-medium text-ink">{cls.label}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{cls.note}</p>
      </div>
    </motion.div>
  )
}
