import { GraduationCap, UserRound } from 'lucide-react'
import Modal from './Modal.jsx'

const SUPERVISOR = { name: 'Ramen Kumar Das' }

const STUDENTS = [
  { name: 'Md. Mazharul Alam', reg: '20502005468' },
  { name: 'Mridol Mondal', reg: '20502005514' },
]

export default function TeamModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Project Team">
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
            <GraduationCap size={16} className="text-accent-dark" />
            Supervisor
          </div>
          <p className="text-sm text-ink-soft">{SUPERVISOR.name}</p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <UserRound size={16} className="text-accent-dark" />
            Submitted by
          </div>
          <ul className="space-y-3">
            {STUDENTS.map((s) => (
              <li key={s.reg} className="rounded-md border border-line/70 bg-white/40 px-4 py-3">
                <p className="text-sm font-medium text-ink">{s.name}</p>
                <p className="text-xs text-ink-soft">Reg. No.: {s.reg}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
