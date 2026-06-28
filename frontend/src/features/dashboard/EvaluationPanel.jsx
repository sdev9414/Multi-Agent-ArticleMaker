// Evaluator agent output: five scored dimensions (0–100) + overall, plus flagged issues.
const DIMENSIONS = [
  { key: 'factuality', label: 'Factuality' },
  { key: 'citationQuality', label: 'Citations' },
  { key: 'readability', label: 'Readability' },
  { key: 'completeness', label: 'Completeness' },
  { key: 'seoQuality', label: 'SEO' },
]

function scoreColor(score) {
  if (score >= 85) return 'bg-deep-green'
  if (score >= 70) return 'bg-action-blue'
  if (score >= 50) return 'bg-coral'
  return 'bg-error'
}

export default function EvaluationPanel({ evaluation }) {
  if (!evaluation) return null
  const overall = evaluation.overallScore ?? 0

  return (
    <section aria-label="Evaluation" className="rounded-lg border border-hairline bg-canvas p-5">
      <header className="flex items-baseline justify-between">
        <h3 className="font-display text-feature-heading text-ink">Evaluation</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-card-heading tabular-nums text-ink">{overall}</span>
          <span className="text-caption text-body-muted">/ 100</span>
        </div>
      </header>

      <dl className="mt-4 flex flex-col gap-3">
        {DIMENSIONS.map(({ key, label }) => {
          const value = evaluation[key] ?? 0
          return (
            <div key={key} className="flex items-center gap-3">
              <dt className="w-28 shrink-0 text-caption text-body-muted">{label}</dt>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft-stone">
                <div className={`h-full rounded-full ${scoreColor(value)}`} style={{ width: `${value}%` }} />
              </div>
              <dd className="w-8 shrink-0 text-right text-caption tabular-nums text-ink">{value}</dd>
            </div>
          )
        })}
      </dl>

      {evaluation.issues?.length > 0 && (
        <div className="mt-5 border-t border-hairline pt-4">
          <p className="mono-label">Flagged issues</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {evaluation.issues.map((issue, i) => (
              <li key={i} className="flex gap-2 text-caption text-body-muted">
                <span className="text-coral" aria-hidden="true">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
