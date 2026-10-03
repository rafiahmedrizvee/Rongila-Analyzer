import { motion } from 'framer-motion'
import { ImageUp, ScanFace, Layers, Sparkles } from 'lucide-react'

const STEPS = [
  {
    icon: ImageUp,
    title: 'Upload or capture',
    body: 'Choose a clear, front-facing photo, or use your camera. Images are checked for format and size before anything else runs.',
  },
  {
    icon: ScanFace,
    title: 'Detect face and skin',
    body: 'The face is located first, then cheeks, forehead, and chin are sampled while hair, eyes, lips, and background are excluded.',
  },
  {
    icon: Layers,
    title: 'Normalize and classify',
    body: 'Lighting is normalized to reduce color shift, then a trained model classifies the sample against the eight-point tone scale.',
  },
  {
    icon: Sparkles,
    title: 'Get guidance',
    body: 'You receive the predicted tone, a confidence score, and a general morning and evening routine suited to that tone.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const card = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line/70 bg-paper-dim py-20">
      <div className="container-page">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">From photo to routine, in four steps</h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              variants={card}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative rounded-lg border border-line/70 bg-paper p-6"
            >
              <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-sm bg-ink text-paper">
                <step.icon size={18} strokeWidth={2} />
              </span>
              <h3 className="mb-2 font-medium text-ink">
                {i + 1}. {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
