import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import StatusChip from '../../components/ui/StatusChip'
import AgentTimeline from './AgentTimeline'
import EvaluationPanel from './EvaluationPanel'
import { useRun } from './useRun'
import { AGENTS } from '../landing/agents'
import { formatCost, formatDuration, formatNumber, formatRelativeTime, statusTone } from '../../utils/format'

export default function DashboardPage() {
  const [params] = useSearchParams()
  const { run, loading, error, refetch } = useRun(params.get('id'))

  if (loading) return <RunSkeleton />
  if (error) return <DashboardError message={error} onRetry={refetch} />
  if (!run) return <NoRun />

  const completed = (run.agentRuns ?? []).filter((r) => r.status === 'completed').length
  const progress = Math.round((completed / AGENTS.length) * 100)

  return (
    <div className="mx-auto flex max-w-container flex-col gap-6">
      <RunHeader run={run} />

      <Progress completed={completed} total={AGENTS.length} percent={progress} status={run.status} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Sources" value={formatNumber(run.sources?.length ?? 0)} />
        <Metric label="Total tokens" value={formatNumber(run.metrics?.totalTokens)} />
        <Metric label="Est. cost" value={formatCost(run.metrics?.totalCostUsd)} />
        <Metric label="Duration" value={formatDuration(run.metrics?.durationMs)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <AgentTimeline agentRuns={run.agentRuns} />
        <div className="flex flex-col gap-6">
          <EvaluationPanel evaluation={run.evaluation} />
          {run.errors?.length > 0 && <ErrorsPanel errors={run.errors} />}
        </div>
      </div>

      {run.status === 'completed' && (
        <div className="flex flex-wrap gap-4 border-t border-hairline pt-6">
          <Button as={Link} to={`/articles/${run.id}`}>View the article</Button>
          <Button as={Link} variant="secondary" to="/create">Create another</Button>
        </div>
      )}
    </div>
  )
}

function RunHeader({ run }) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <StatusChip tone={statusTone(run.status)}>{run.status}</StatusChip>
        {run.metrics?.provider && (
          <span className="mono-label">{run.metrics.provider} · {run.metrics.model}</span>
        )}
        {run.createdAt && <span className="text-caption text-muted">{formatRelativeTime(run.createdAt)}</span>}
      </div>
      <h2 className="font-display text-section-heading text-ink">{run.title || run.topic}</h2>
      <p className="text-caption text-body-muted">
        {run.articleType} · {run.audience}
      </p>
    </header>
  )
}

function Progress({ completed, total, percent, status }) {
  const tone = status === 'failed' ? 'bg-error' : 'bg-deep-green'
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-5">
      <div className="flex items-baseline justify-between">
        <p className="mono-label">Progress</p>
        <p className="text-caption tabular-nums text-body-muted">{completed} / {total} agents</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-soft-stone" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all duration-500 ease-out-quart ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-sm border border-hairline bg-canvas p-4">
      <p className="mono-label">{label}</p>
      <p className="mt-1.5 font-display text-card-heading tabular-nums text-ink">{value}</p>
    </div>
  )
}

function ErrorsPanel({ errors }) {
  return (
    <section aria-label="Errors" className="rounded-lg border border-error/30 bg-error/5 p-5">
      <p className="mono-label text-error">Errors</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {errors.map((e, i) => (
          <li key={i} className="text-caption text-error">{e}</li>
        ))}
      </ul>
    </section>
  )
}

function NoRun() {
  return (
    <div className="mx-auto max-w-container">
      <EmptyState
        icon={<PulseIcon />}
        title="No runs yet"
        description="Start an article to watch the agent pipeline execute here — agent timeline, progress, sources, token usage, cost, and the evaluation score."
        action={<Button as={Link} to="/create">Create an article</Button>}
      />
    </div>
  )
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="mx-auto max-w-container">
      <EmptyState
        icon={<PulseIcon />}
        title="Couldn't load the run"
        description={message}
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    </div>
  )
}

function RunSkeleton() {
  return (
    <div className="mx-auto flex max-w-container animate-pulse flex-col gap-6" aria-busy="true" aria-label="Loading run">
      <div className="h-8 w-2/3 rounded-sm bg-soft-stone" />
      <div className="h-16 rounded-lg bg-soft-stone" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-sm bg-soft-stone" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="h-96 rounded-lg bg-soft-stone" />
        <div className="h-72 rounded-lg bg-soft-stone" />
      </div>
    </div>
  )
}

function PulseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <path d="M2 20h8l4-12 8 24 4-12h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
