import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import StatusChip from '../../components/ui/StatusChip'
import { useArticles } from './useArticles'
import { formatRelativeTime, statusTone } from '../../utils/format'

export default function HistoryPage() {
  const [query, setQuery] = useState('')
  const { articles, loading, error, refetch, remove, removingId } = useArticles()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return articles
    return articles.filter((a) =>
      [a.title, a.topic].filter(Boolean).some((t) => t.toLowerCase().includes(q))
    )
  }, [articles, query])

  return (
    <div className="mx-auto max-w-container">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-section-heading text-ink">History</h2>
          <p className="mt-2 text-body text-body-muted">Every article you've generated, with its evaluation score.</p>
        </div>
        <Field
          id="history-search"
          type="search"
          placeholder="Search topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:w-72"
          disabled={loading || (!articles.length && !query)}
        />
      </header>

      {error ? (
        <EmptyState
          icon={<ArchiveIcon />}
          title="Couldn't load history"
          description={error}
          action={<Button onClick={refetch}>Try again</Button>}
        />
      ) : loading ? (
        <HistorySkeleton />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={<ArchiveIcon />}
          title="No articles yet"
          description="Generated articles are saved here automatically. Run the pipeline once and your history starts filling up."
          action={<Button as={Link} to="/create">Create your first article</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ArchiveIcon />}
          title="No matches"
          description={`No saved article matches "${query}". Try a different search.`}
          action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>}
        />
      ) : (
        <ul className="divide-y divide-hairline border-y border-hairline">
          {filtered.map((a) => (
            <HistoryRow key={a.id} article={a} onDelete={remove} deleting={removingId === a.id} />
          ))}
        </ul>
      )}
    </div>
  )
}

function HistoryRow({ article, onDelete, deleting }) {
  const handleDelete = () => {
    if (window.confirm(`Delete "${article.title || article.topic}"? This can't be undone.`)) {
      onDelete(article.id)
    }
  }

  return (
    <li className="flex items-center gap-4 py-4">
      <Link to={`/articles/${article.id}`} className="group min-w-0 flex-1">
        <p className="truncate text-body-large text-ink group-hover:underline group-hover:underline-offset-4">
          {article.title || article.topic}
        </p>
        <p className="mt-1 truncate text-caption text-body-muted">{article.topic}</p>
      </Link>

      <div className="hidden w-40 shrink-0 sm:block">
        <StatusChip tone={statusTone(article.status)}>{article.status}</StatusChip>
      </div>

      <div className="hidden w-16 shrink-0 text-right tabular-nums sm:block">
        {article.overallScore != null ? (
          <span className="text-body text-ink">{article.overallScore}</span>
        ) : (
          <span className="text-caption text-muted">—</span>
        )}
      </div>

      <div className="hidden w-20 shrink-0 text-right text-caption text-muted md:block">
        {formatRelativeTime(article.createdAt)}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleDelete}
        loading={deleting}
        aria-label={`Delete ${article.title || article.topic}`}
        className="shrink-0 text-caption text-body-muted hover:text-error"
      >
        Delete
      </Button>
    </li>
  )
}

function HistorySkeleton() {
  return (
    <ul className="animate-pulse divide-y divide-hairline border-y border-hairline" aria-busy="true" aria-label="Loading history">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 py-5">
          <div className="min-w-0 flex-1">
            <div className="h-4 w-2/3 rounded-xs bg-soft-stone" />
            <div className="mt-2 h-3 w-1/3 rounded-xs bg-soft-stone" />
          </div>
          <div className="hidden h-5 w-20 rounded-full bg-soft-stone sm:block" />
        </li>
      ))}
    </ul>
  )
}

function ArchiveIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <path d="M5 11h30v6H5zM7 17h26v18H7zM16 24h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
