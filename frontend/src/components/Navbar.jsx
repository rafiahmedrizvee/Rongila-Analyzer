import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Users } from 'lucide-react'
import { SKIN_TONE_CLASSES } from '../utils/helpers.js'
import Button from './Button.jsx'
import TeamModal from './TeamModal.jsx'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/guide', label: 'Skin Care Guide' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="swatch-strip h-6 w-9 shrink-0">
            {SKIN_TONE_CLASSES.slice(0, 4).map((s) => (
              <span key={s.id} style={{ backgroundColor: s.swatch }} />
            ))}
          </span>
          <span className="flex items-baseline gap-1.5">
            <span lang="bn" className="font-bengali text-xl font-semibold tracking-tight">
              রঙিলা
            </span>
            <span className="hidden text-xs text-ink-soft sm:inline">(Rongila)</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`relative pb-1 text-sm transition-colors ${
                  isActive ? 'text-ink font-medium' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setTeamOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-ink/5 hover:text-ink"
          >
            <Users size={15} />
            Project Team
          </button>
          <Button as={Link} to="/analyze" variant="accent" size="sm">
            Analyze skin tone
          </Button>
        </div>

        <button
          className="p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-line/70 bg-paper md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-ink-soft hover:bg-ink/5 hover:text-ink"
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setOpen(false)
                  setTeamOpen(true)
                }}
                className="flex items-center gap-1.5 rounded-md px-2 py-2.5 text-left text-ink-soft hover:bg-ink/5 hover:text-ink"
              >
                <Users size={15} />
                Project Team
              </button>
              <Button as={Link} to="/analyze" variant="accent" className="mt-2" onClick={() => setOpen(false)}>
                Analyze skin tone
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="swatch-strip h-[3px] rounded-none">
        {SKIN_TONE_CLASSES.map((s) => (
          <span key={s.id} style={{ backgroundColor: s.swatch }} />
        ))}
      </div>

      <TeamModal open={teamOpen} onClose={() => setTeamOpen(false)} />
    </header>
  )
}
