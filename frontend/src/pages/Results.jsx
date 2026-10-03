import { Link, useLocation } from 'react-router-dom'
import { RefreshCcw } from 'lucide-react'
import ResultCard from '../components/ResultCard.jsx'
import GuidanceCard from '../components/GuidanceCard.jsx'
import Button from '../components/Button.jsx'
import { GUIDANCE_BY_CLASS } from '../utils/helpers.js'

const SAMPLE_RESULT = {
  success: true,
  skin_tone: 'Medium',
  skin_tone_id: 'medium',
  confidence: 0.91,
  face_detected: true,
  skin_region_detected: true,
  processing_time: '1.2s',
  guidance: GUIDANCE_BY_CLASS.medium,
}

export default function Results() {
  const { state } = useLocation()
  const result = state?.result || SAMPLE_RESULT
  const imageSrc = state?.imageSrc || null
  const isSample = !state?.result

  return (
    <div className="container-page max-w-3xl py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Skin analysis result</h1>
        <Button as={Link} to="/analyze" variant="outline" size="sm" icon={RefreshCcw}>
          Analyze another image
        </Button>
      </div>

      {isSample && (
        <p className="mt-4 rounded-md bg-accent-tint px-4 py-3 text-sm text-accent-dark">
          This is a sample result. Run an analysis to see your own.
        </p>
      )}

      {result.lighting_warning && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {result.lighting_warning}
        </p>
      )}

      <div className="mt-8 space-y-8">
        <ResultCard result={result} imageSrc={imageSrc} />
        <GuidanceCard guidance={result.guidance} />

        <p className="rounded-md border border-line/70 bg-white/40 p-5 text-xs leading-relaxed text-ink-soft">
          This tool provides an AI-based estimate of visible skin tone for educational and
          informational purposes. Results may vary depending on lighting, camera quality, image
          quality, and other factors. This system does not diagnose medical conditions or replace
          professional dermatological advice.
        </p>
      </div>
    </div>
  )
}
