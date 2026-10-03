import axios from 'axios'
import { SKIN_TONE_CLASSES, GUIDANCE_BY_CLASS } from '../utils/helpers.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
})

// The FastAPI backend and trained model are now live (see /backend).
// Flip this back to true if you want to demo the UI without running the
// backend locally.
const USE_MOCK = false

export async function checkHealth() {
  if (USE_MOCK) return { status: 'ok' }
  const { data } = await client.get('/api/health')
  return data
}

export async function predictSkinTone(imageFile, { onProgress } = {}) {
  if (USE_MOCK) {
    return mockPredict({ onProgress })
  }

  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    const { data } = await client.post('/api/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          // Cap at 90 during the upload itself — the remaining 10% covers
          // server-side processing time (segmentation + model inference),
          // which has no progress events of its own.
          onProgress(Math.min(90, Math.round((evt.loaded / evt.total) * 90)))
        }
      },
    })
    onProgress?.(100)
    return data
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error('The request timed out. Please try again.')
    }
    if (!err.response) {
      throw new Error('Unable to connect to the analysis server. Please try again.')
    }
    const detail = err.response.data?.detail
    throw new Error(detail || 'Something went wrong while analyzing the image.')
  }
}

function mockPredict({ onProgress } = {}) {
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      onProgress?.(Math.min(progress, 100))
      if (progress >= 100) {
        clearInterval(interval)
        const picked = SKIN_TONE_CLASSES[Math.floor(Math.random() * SKIN_TONE_CLASSES.length)]
        resolve({
          success: true,
          skin_tone: picked.label,
          skin_tone_id: picked.id,
          confidence: Number((0.78 + Math.random() * 0.2).toFixed(2)),
          face_detected: true,
          skin_region_detected: true,
          processing_time: '1.4s',
          guidance: GUIDANCE_BY_CLASS[picked.id],
        })
      }
    }, 350)
  })
}
