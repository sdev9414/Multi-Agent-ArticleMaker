import { cn } from '../../utils/cn'

// Pipeline agent states → DESIGN.md semantic colors. Uppercase mono status marker.
const TONES = {
  idle: 'text-slate border-hairline',
  running: 'text-action-blue border-action-blue',
  done: 'text-deep-green border-deep-green',
  error: 'text-error border-error',
  neutral: 'text-ink border-border-light',
}

export default function StatusChip({ tone = 'idle', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-micro uppercase tracking-[0.28px]',
        TONES[tone],
        className
      )}
    >
      {tone === 'running' && (
        <span className="size-1.5 animate-pulse rounded-full bg-action-blue" aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
