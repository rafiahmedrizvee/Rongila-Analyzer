import { RotateCcw } from 'lucide-react'
import Button from './Button.jsx'

export default function ImagePreview({ src, onRetake }) {
  if (!src) return null
  return (
    <div className="rounded-lg border border-line/70 p-4">
      <img src={src} alt="Ready to analyze" className="mx-auto max-h-80 rounded-md object-contain" />
      <div className="mt-4 flex justify-center">
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onRetake}>
          Choose a different photo
        </Button>
      </div>
    </div>
  )
}
