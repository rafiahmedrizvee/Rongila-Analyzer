import { useCallback, useEffect, useRef, useState } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream

      // videoRef.current must already be mounted in the DOM for this to
      // work — the consuming component keeps the <video> element always
      // rendered (hidden via CSS when inactive) rather than conditionally
      // mounting it on `isActive`, since `isActive` only flips to true
      // *after* this runs, which previously meant the ref was still null
      // here and the stream was silently never attached to anything.
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch {
          // Can reject with AbortError on a very fast stop/start cycle;
          // the stream itself is still valid, so don't treat this as a
          // camera-access failure.
        }
      }
      setIsActive(true)
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access and try again.'
          : 'Unable to access the camera on this device.'
      )
      setIsActive(false)
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }, [])

  const capture = useCallback(() => {
    if (!videoRef.current) return null
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  useEffect(() => stop, [stop])

  return { videoRef, isActive, error, start, stop, capture }
}
