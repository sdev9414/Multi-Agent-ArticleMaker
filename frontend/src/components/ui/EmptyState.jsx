import { cn } from '../../utils/cn'

/**
 * Teaching empty state — explains the surface and offers the next action.
 * `icon` is an optional thin-line glyph; `action` is an optional Button/Link.
 */
export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline px-6 py-16 text-center',
        className
      )}
    >
      {icon && <div className="mb-5 text-slate" aria-hidden="true">{icon}</div>}
      <h3 className="font-display text-feature-heading text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-prose text-body text-body-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
