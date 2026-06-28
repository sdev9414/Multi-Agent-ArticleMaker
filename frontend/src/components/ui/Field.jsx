import { cn } from '../../utils/cn'

const baseField =
  'w-full rounded-xs border bg-canvas px-3.5 py-2.5 text-body text-ink placeholder:text-muted transition-colors duration-150 ' +
  'focus:border-form-focus focus:outline-none focus:ring-2 focus:ring-form-focus/30 ' +
  'disabled:bg-soft-stone disabled:text-muted disabled:cursor-not-allowed'

/**
 * Labeled field wrapper covering label · hint · error states (DESIGN.md contact-form-card).
 * Renders <input>, <textarea>, or <select> via `as`.
 */
export default function Field({
  as = 'input',
  id,
  label,
  hint,
  error,
  className,
  children,
  ...props
}) {
  const Tag = as
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-caption font-medium text-ink">
          {label}
        </label>
      )}
      <Tag
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(baseField, error && 'border-error focus:border-error focus:ring-error/30')}
        {...props}
      >
        {children}
      </Tag>
      {error ? (
        <p id={`${id}-error`} className="text-caption text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-caption text-body-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
