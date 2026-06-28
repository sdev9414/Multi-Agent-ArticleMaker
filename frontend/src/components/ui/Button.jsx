import { cn } from '../../utils/cn'

const VARIANTS = {
  // Near-black pill — the single highest-priority action (DESIGN.md button-primary).
  primary:
    'bg-primary text-white rounded-pill hover:bg-black active:bg-black disabled:bg-muted disabled:cursor-not-allowed',
  // White pill for dark surfaces.
  inverse:
    'bg-white text-primary rounded-pill hover:bg-soft-stone active:bg-soft-stone disabled:opacity-50 disabled:cursor-not-allowed',
  // Underlined text link — companion secondary action.
  secondary:
    'bg-transparent text-ink underline underline-offset-4 decoration-hairline hover:decoration-ink rounded-none px-0 disabled:text-muted disabled:no-underline',
  // Outlined pill — lightweight taxonomy / filter control.
  outline:
    'bg-transparent text-primary border border-primary rounded-xl hover:bg-primary hover:text-white disabled:opacity-40',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-button',
  md: 'px-6 py-3 text-button',
}

/**
 * Pill / text-link button covering default · hover · active · disabled · loading.
 */
export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <Tag
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 ease-out-quart',
        VARIANTS[variant],
        variant !== 'secondary' && SIZES[size],
        className
      )}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </Tag>
  )
}
