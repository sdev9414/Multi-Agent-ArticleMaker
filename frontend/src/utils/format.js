// Small display formatters shared across observability surfaces.

export function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(Math.round(n ?? 0))
}

// Cost is tiny (fractions of a cent → a few cents); show enough precision to be useful.
export function formatCost(usd) {
  const value = usd ?? 0
  if (value === 0) return '$0.00'
  if (value < 0.01) return `$${value.toFixed(4)}`
  return `$${value.toFixed(2)}`
}

export function formatDuration(ms) {
  const value = ms ?? 0
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(1)} s`
}

export function formatRelativeTime(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

// Map a run/agent status to a StatusChip tone.
export function statusTone(status) {
  switch (status) {
    case 'completed':
      return 'done'
    case 'running':
      return 'running'
    case 'failed':
      return 'error'
    case 'pending':
      return 'idle'
    default:
      return 'neutral'
  }
}
