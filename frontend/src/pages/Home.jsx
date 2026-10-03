import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScanFace, SlidersHorizontal, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import Hero from '../components/Hero.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import FeatureCard from '../components/FeatureCard.jsx'
import SkinToneCard from '../components/SkinToneCard.jsx'
import FAQ from '../components/FAQ.jsx'
import Button from '../components/Button.jsx'
import { SKIN_TONE_CLASSES, FAQ_ITEMS } from '../utils/helpers.js'

const FEATURES = [
  {
    icon: ScanFace,
    title: 'Face-aware segmentation',
    body: 'Cheeks, forehead, and chin are sampled directly; hair, eyes, lips, and background are excluded from the read.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Lighting normalization',
    body: 'Preprocessing reduces the effect of white balance and exposure before the model ever sees the image.',
  },
  {
    icon: Sparkles,
    title: 'Trained, data-driven classifier',
    body: 'A model trained on measured color statistics, not a fixed RGB threshold rule.',
  },
  {
    icon: ShieldCheck,
    title: 'Tone-aware guidance',
    body: 'Every tone class gets full sun-protection guidance — including deeper tones, which need it too.',
  },
]

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />

      <section className="container-page py-20">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Built on real computer vision</h2>
        <p className="mt-3 max-w-prose text-ink-soft">
          Not a single average pixel value. The pipeline combines face detection, skin
          segmentation, and a trained classifier.
        </p>
        <motion.div
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </motion.div>
      </section>

      <section className="border-t border-line/70 bg-paper-dim py-20">
        <div className="container-page">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">The eight-point tone scale</h2>
          <p className="mt-3 max-w-prose text-ink-soft">
            Every prediction lands on one of these classes, each documented against the labeled dataset.
          </p>
          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {SKIN_TONE_CLASSES.map((cls) => (
              <SkinToneCard key={cls.id} cls={cls} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container-page py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid gap-10 rounded-xl border border-line/70 bg-white/40 p-10 md:grid-cols-2 md:p-14"
        >
          <div>
            <h2 className="font-display text-3xl tracking-tight">Why it matters</h2>
            <p className="mt-4 max-w-prose text-ink-soft">
              Generic skincare advice ignores how differently tones respond to sun exposure and
              certain ingredients. Matching guidance to visible tone is a small step toward
              routines that actually fit.
            </p>
          </div>
          <ul className="space-y-4 self-center text-sm text-ink-soft">
            <li>— Every class receives sun-protection guidance, without exception.</li>
            <li>— Skin tone and skin type are treated as separate questions.</li>
            <li>— The model reads visible tone only, never identity or ethnicity.</li>
          </ul>
        </motion.div>
      </section>

      <section className="border-t border-line/70 bg-paper-dim py-20">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">See a sample analysis</h2>
            <p className="mt-3 max-w-prose text-ink-soft">
              Every result includes the detected tone, a confidence score, and a routine —
              exactly what you'll get after analyzing your own photo.
            </p>
            <Button as={Link} to="/results" variant="outline" className="mt-6" icon={ArrowRight} iconPosition="right">
              View sample result
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="rounded-lg border border-line/70 bg-paper p-6"
          >
            <div className="flex items-center justify-between border-b border-line/70 pb-4">
              <span className="text-sm text-ink-soft">Skin tone</span>
              <span className="font-medium text-ink">Medium</span>
            </div>
            <div className="flex items-center justify-between border-b border-line/70 py-4">
              <span className="text-sm text-ink-soft">Confidence</span>
              <span className="font-medium text-accent-dark">91%</span>
            </div>
            <div className="pt-4 text-sm text-ink-soft">
              Morning routine: gentle cleanser, moisturizer, broad-spectrum SPF 30+.
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Questions people ask</h2>
        <div className="mt-10">
          <FAQ items={FAQ_ITEMS} />
        </div>
      </section>

      <section className="border-t border-line/70 bg-ink py-20 text-paper">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="container-page text-center"
        >
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Ready to see your result?</h2>
          <p className="mx-auto mt-3 max-w-prose text-paper/70">
            Takes under a minute. No account needed.
          </p>
          <Button as={Link} to="/analyze" variant="accent" size="lg" className="mt-8" icon={ArrowRight} iconPosition="right">
            Analyze your skin tone
          </Button>
        </motion.div>
      </section>
    </>
  )
}
