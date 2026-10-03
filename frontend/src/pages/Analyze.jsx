import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Camera as CameraIcon, ArrowRight } from 'lucide-react'
import UploadBox from '../components/UploadBox.jsx'
import CameraCapture from '../components/CameraCapture.jsx'
import ImagePreview from '../components/ImagePreview.jsx'
import AnalysisLoader from '../components/AnalysisLoader.jsx'
import Button from '../components/Button.jsx'
import { predictSkinTone } from '../services/api.js'

const TABS = [
  { id: 'upload', label: 'Upload image', icon: UploadCloud },
  { id: 'camera', label: 'Use camera', icon: CameraIcon },
]

export default function Analyze() {
  const [tab, setTab] = useState('upload')
  const [file, setFile] = useState(null)
  const [previewSrc, setPreviewSrc] = useState(null)
  const [status, setStatus] = useState('idle') // idle | analyzing | error
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState(null)
  const navigate = useNavigate()

  const handleImageSelected = (selectedFile, src) => {
    setFile(selectedFile)
    setPreviewSrc(src)
    setErrorMsg(null)
  }

  const handleAnalyze = async () => {
    if (!file) {
      setErrorMsg('Please upload or capture an image first.')
      return
    }
    setStatus('analyzing')
    setProgress(0)
    setErrorMsg(null)
    try {
      const result = await predictSkinTone(file, { onProgress: setProgress })
      navigate('/results', { state: { result, imageSrc: previewSrc } })
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  if (status === 'analyzing') {
    return (
      <div className="container-page py-24">
        <AnalysisLoader progress={progress} />
      </div>
    )
  }

  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Analyze your skin tone</h1>
      <p className="mt-3 text-ink-soft">
        Use a clear, front-facing photo with even lighting for the most reliable result.
      </p>

      {!previewSrc && (
        <div className="mt-8 inline-flex rounded-md border border-line/70 bg-white/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-sm px-4 py-2 text-sm transition-colors ${
                tab === t.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {previewSrc ? (
          <ImagePreview src={previewSrc} onRetake={() => handleImageSelected(null, null)} />
        ) : tab === 'upload' ? (
          <UploadBox onImageSelected={handleImageSelected} />
        ) : (
          <CameraCapture onImageSelected={handleImageSelected} />
        )}
      </div>

      {errorMsg && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          onClick={handleAnalyze}
          variant="accent"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          disabled={!file}
        >
          Analyze skin tone
        </Button>
      </div>

      <p className="mt-10 border-t border-line/70 pt-6 text-xs leading-relaxed text-ink-soft">
        Your uploaded image is processed for skin tone analysis and is not permanently stored.
        Avoid uploading images containing sensitive personal information.
      </p>
    </div>
  )
}
