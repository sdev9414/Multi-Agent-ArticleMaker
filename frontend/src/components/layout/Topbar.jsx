import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/create', label: 'Create Article' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
]

/** Slim topbar: page context + primary action on desktop, menu toggle on mobile. */
export default function Topbar({ title }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/90 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-6 md:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
          <h1 className="font-display text-feature-heading text-ink">{title}</h1>
        </div>
        <Button as={NavLink} to="/create" size="sm" className="max-md:hidden">
          New article
        </Button>
      </div>

      {open && (
        <nav className="flex flex-col gap-0.5 border-t border-hairline p-3 md:hidden" aria-label="Primary">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-sm px-3 py-2.5 text-body',
                  isActive ? 'bg-soft-stone text-ink' : 'text-body-muted'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {open ? (
        <path d="M5 5l12 12M17 5L5 17" strokeLinecap="round" />
      ) : (
        <path d="M3 6h16M3 11h16M3 16h16" strokeLinecap="round" />
      )}
    </svg>
  )
}
