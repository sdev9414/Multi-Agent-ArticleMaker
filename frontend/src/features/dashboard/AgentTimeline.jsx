import { AGENTS } from '../landing/agents'
import StatusChip from '../../components/ui/StatusChip'
import { formatCost, formatDuration, formatNumber, statusTone } from '../../utils/format'

// The pipeline as a vertical timeline. Each agent shows its outcome + observability
// (latency, tokens, cost). Agents with no recorded run render as "pending".
export default function AgentTimeline({ agentRuns = [] }) {
  const byAgent = Object.fromEntries(agentRuns.map((r) => [r.agent, r]))

  return (
    <section aria-label="Agent pipeline" className="rounded-lg border border-hairline bg-canvas">
      <header className="border-b border-hairline px-5 py-4">
        <h3 className="font-display text-feature-heading text-ink">Pipeline</h3>
        <p className="mt-0.5 text-caption text-body-muted">Six agents, executed in order.</p>
      </header>

      <ol className="divide-y divide-hairline">
        {AGENTS.map((agent, index) => {
          const run = byAgent[agent.key]
          const status = run?.status ?? 'pending'
          return (
            <li key={agent.key} className="flex items-start gap-4 px-5 py-4">
              <span className="mono-label w-5 shrink-0 pt-0.5 tabular-nums">{index + 1}</span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-body font-medium text-ink">{agent.name}</span>
                  <StatusChip tone={statusTone(status)}>{status}</StatusChip>
                </div>
                <p className="mt-1 text-caption text-body-muted">{agent.does}</p>

                {run && (
                  <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-micro text-slate">
                    <Stat label="latency" value={formatDuration(run.latencyMs)} />
                    <Stat label="tokens" value={formatNumber((run.tokensInput ?? 0) + (run.tokensOutput ?? 0))} />
                    <Stat label="cost" value={formatCost(run.costUsd)} />
                    {run.retries > 0 && <Stat label="retries" value={run.retries} />}
                  </dl>
                )}

                {run?.error && (
                  <p className="mt-2 rounded-xs border border-error/30 bg-error/5 px-3 py-1.5 text-micro text-error">
                    {run.error}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="font-mono uppercase tracking-[0.28px] text-muted">{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  )
}
