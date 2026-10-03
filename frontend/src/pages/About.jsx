import { GraduationCap, UserRound } from 'lucide-react'
import { SKIN_TONE_CLASSES } from '../utils/helpers.js'

const SUPERVISOR = { name: 'Ramen Kumar Das' }
const STUDENTS = [
  { name: 'Md. Mazharul Alam', reg: '20502005468' },
  { name: 'Mridol Mondal', reg: '20502005514' },
]

export default function About() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">About this project</h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">
        রঙিলা (Rongila) is a final-year computer vision project: "Skin Tone Classification Using Computer
        Vision and Skin Care Guidance." It combines face detection, skin-region segmentation, and
        a trained classifier to estimate visible skin tone from a photo, then maps that result
        to general skincare guidance.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">How classification works</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-ink-soft">
          Rather than averaging every pixel in an image, the pipeline detects the face first, then
          samples stable regions — cheeks, forehead, and chin — while excluding hair, eyes, lips,
          and background. Lighting is normalized before a trained model classifies the sample into
          one of eight tone classes.
        </p>
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SKIN_TONE_CLASSES.map((cls) => (
            <div key={cls.id} className="flex flex-col items-center gap-2">
              <span className="h-10 w-full rounded-sm" style={{ backgroundColor: cls.swatch }} aria-hidden />
              <span className="text-center text-[10px] text-ink-soft">{cls.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Fairness and scope</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-ink-soft">
          The model classifies only the visible skin tone captured in a photo. It is not designed
          or trained to infer ethnicity, nationality, gender, or race, and performance is tested
          across different tones, lighting conditions, cameras, and orientations.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Limitations</h2>
        <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
          <li>Predictions are estimates and can shift with lighting, camera, and image quality.</li>
          <li>This is a classification tool, not a medical diagnostic instrument.</li>
          <li>Skin tone and skin type are distinct — this project addresses tone only.</li>
        </ul>
      </section>

      <section className="mt-12 rounded-lg border border-line/70 bg-paper-dim p-7">
        <h2 className="font-display text-2xl tracking-tight">Project team</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <GraduationCap size={16} className="text-accent-dark" />
              Supervisor
            </div>
            <p className="text-sm text-ink-soft">{SUPERVISOR.name}</p>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <UserRound size={16} className="text-accent-dark" />
              Submitted by
            </div>
            <ul className="space-y-1">
              {STUDENTS.map((s) => (
                <li key={s.reg} className="text-sm text-ink-soft">
                  {s.name} <span className="text-xs text-ink-soft/70">(Reg. No.: {s.reg})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
