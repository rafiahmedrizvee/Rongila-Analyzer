import { motion } from 'framer-motion'

const card = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function FeatureCard({ icon: Icon, title, body }) {
  return (
    <motion.div
      variants={card}
      whileHover={{ y: -4, borderColor: 'rgba(31, 111, 92, 0.4)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-lg border border-line/70 bg-white/40 p-6"
    >
      <Icon size={20} strokeWidth={2} className="mb-4 text-accent-dark" />
      <h3 className="mb-2 font-medium text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
    </motion.div>
  )
}
