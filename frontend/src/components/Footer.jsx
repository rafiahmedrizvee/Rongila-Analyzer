import { Link } from 'react-router-dom'
import { SKIN_TONE_CLASSES } from '../utils/helpers.js'

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-paper-dim">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <span className="mb-3 flex items-baseline gap-1.5">
            <span className="swatch-strip h-6 w-9">
              {SKIN_TONE_CLASSES.slice(0, 4).map((s) => (
                <span key={s.id} style={{ backgroundColor: s.swatch }} />
              ))}
            </span>
            <span lang="bn" className="font-bengali text-lg font-semibold tracking-tight">
              রঙিলা
            </span>
          </span>
          <p className="max-w-xs text-sm text-ink-soft">
            An educational tool for AI-based visible skin tone estimation and general skincare guidance.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={[
            { to: '/analyze', label: 'Analyze your skin tone' },
            { to: '/guide', label: 'Skin care guide' },
            { to: '/results', label: 'Sample result' },
          ]}
        />
        <FooterColumn
          title="Project"
          links={[
            { to: '/about', label: 'About this project' },
            { to: '/contact', label: 'Contact' },
          ]}
        />
        <div>
          <h3 className="mb-4 text-sm font-medium text-ink">Ethical use</h3>
          <p className="text-sm leading-relaxed text-ink-soft">
            This tool does not diagnose medical conditions or determine identity, ethnicity, or race.
            It estimates visible skin tone from an image for educational purposes only.
          </p>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} রঙিলা (Rongila) — Final-year academic project.</p>
          <p>Not a substitute for professional dermatological advice.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-ink">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-ink-soft hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
