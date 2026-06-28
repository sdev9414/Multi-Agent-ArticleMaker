import { useEffect, useState } from 'react'
import StatusChip from '../../components/ui/StatusChip'
import { getConfig } from '../../services/articles'

// Read-only configuration view. Keys and provider selection live server-side as
// environment variables; this surface reflects the live runtime config.
export default function SettingsPage() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getConfig()
      .then((data) => active && setConfig(data))
      .catch((err) => active && setError(typeof err === 'string' ? err : 'Could not load configuration.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const ai = config?.aiService

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h2 className="font-display text-section-heading text-ink">Settings</h2>
        <p className="mt-2 max-w-prose text-body text-body-muted">
          How the pipeline runs. Provider selection and API keys are managed server-side as
          environment variables — this view reflects the live configuration.
        </p>
      </header>

      <div className="flex flex-col gap-6 rounded-lg border border-hairline bg-canvas p-6 md:p-8">
        <section>
          <div className="flex items-center justify-between">
            <p className="mono-label">AI service</p>
            {loading ? (
              <span className="text-caption text-muted">checking…</span>
            ) : (
              <StatusChip tone={ai?.reachable ? 'done' : 'error'}>
                {ai?.reachable ? 'connected' : 'unreachable'}
              </StatusChip>
            )}
          </div>

          {error ? (
            <p className="mt-3 text-caption text-error">{error}</p>
          ) : (
            <dl className="mt-4 divide-y divide-hairline border-y border-hairline">
              <Row label="Provider" value={loading ? null : ai?.provider} />
              <Row label="Model" value={loading ? null : ai?.model} />
            </dl>
          )}
        </section>

        <div className="rounded-sm border border-border-light bg-pale-green/40 p-4">
          <p className="mono-label text-deep-green">Provider keys</p>
          <p className="mt-1.5 text-caption text-body-muted">
            OpenAI, Gemini, and Tavily keys are read from the AI service environment and are
            never entered or stored in the browser. To switch providers or models, edit
            <code className="mx-1 rounded-xs bg-soft-stone px-1.5 py-0.5 font-mono text-micro">ai-service/.env</code>
            (<code className="rounded-xs bg-soft-stone px-1.5 py-0.5 font-mono text-micro">LLM_PROVIDER</code>) and restart the service.
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-body text-body-muted">{label}</dt>
      <dd className="text-body tabular-nums text-ink">
        {value == null ? <span className="text-muted">—</span> : <span className="font-mono text-caption">{value}</span>}
      </dd>
    </div>
  )
}
