import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

// Tool surfaces. Landing (/) lives outside the shell.
const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/create', label: 'Create Article' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-canvas md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-hairline px-6">
        <span className="size-2.5 rounded-full bg-deep-green" aria-hidden="true" />
        <NavLink to="/" className="font-display text-body font-medium tracking-tight text-ink">
          Newsroom
        </NavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Primary">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-sm px-3 py-2.5 text-body transition-colors duration-150',
                isActive ? 'bg-soft-stone text-ink' : 'text-body-muted hover:bg-soft-stone/60 hover:text-ink'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-hairline p-6">
        <p className="mono-label">AI Workflow Engine</p>
        <p className="mt-1 text-micro text-muted">Six agents · one pipeline</p>
      </div>
    </aside>
  )
}
