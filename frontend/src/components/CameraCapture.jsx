import { useEffect } from 'react'
import { Camera, RotateCcw, Circle } from 'lucide-react'
import { useCamera } from '../hooks/useCamera.js'
import Button from './Button.jsx'

export default function CameraCapture({ onImageSelected }) {
  const { videoRef, isActive, error, start, stop, capture } = useCamera()

  useEffect(() => {
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCapture = () => {
    const dataUrl = capture()
    if (!dataUrl) return
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        onImageSelected(file, dataUrl)
        stop()
      })
  }

  return (
    <div className="rounded-lg border border-line/70 p-6">
      {/* The video element stays mounted at all times (just hidden when
          inactive) so the camera stream always has a real DOM node to
          attach to the moment it's granted — see useCamera.js for why
          conditionally mounting this broke the live preview. */}
      <div className={isActive ? 'flex flex-col items-center gap-5' : 'hidden'}>
        <div className="w-full overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} className="w-full -scale-x-100" playsInline autoPlay muted />
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={stop} variant="outline" icon={RotateCcw}>
            Cancel
          </Button>
          <Button onClick={handleCapture} variant="accent" icon={Circle}>
            Capture
          </Button>
        </div>
      </div>

      {!isActive && (
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <Camera size={28} className="text-accent-dark" />
          <p className="text-sm text-ink-soft">Use your device camera to take a front-facing photo.</p>
          <Button onClick={start} variant="accent">
            Enable camera
          </Button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      )}
    </div>
  )
}
