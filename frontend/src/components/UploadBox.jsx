import { useCallback, useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_MB = 8

export default function UploadBox({ onImageSelected }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)

  const validateAndSet = useCallback(
    (file) => {
      if (!file) return
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please upload a JPG, JPEG, or PNG image.')
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image is too large. Please use a file under ${MAX_SIZE_MB}MB.`)
        return
      }
      setError(null)
      const url = URL.createObjectURL(file)
      setPreview(url)
      onImageSelected(file, url)
    },
    [onImageSelected]
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    validateAndSet(e.dataTransfer.files?.[0])
  }

  const removeImage = () => {
    setPreview(null)
    onImageSelected(null, null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-line/70">
        <img src={preview} alt="Selected preview" className="max-h-96 w-full object-cover" />
        <button
          onClick={removeImage}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/80 text-paper hover:bg-ink"
          aria-label="Remove image"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          dragActive ? 'border-accent bg-accent-tint' : 'border-line hover:border-accent/50'
        }`}
      >
        <UploadCloud size={28} className="text-accent-dark" />
        <p className="text-sm font-medium text-ink">Drag and drop a photo, or click to browse</p>
        <p className="text-xs text-ink-soft">JPG or PNG, up to {MAX_SIZE_MB}MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}
