import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import StatusChip from '../../components/ui/StatusChip'
import EvaluationPanel from '../dashboard/EvaluationPanel'
import Markdown from './Markdown'
import { useArticle } from './useArticle'
import { articlesApi } from '../../services/articles'
import { formatCost, formatNumber, statusTone } from '../../utils/format'

export default function ArticleViewerPage() {
  const { id } = useParams()
  const { article, loading, error, refetch } = useArticle(id)

  return (
    <div className="mx-auto max-w-prose">
      <Link to="/history" className="text-caption text-body-muted hover:text-ink">
        ← Back to history
      </Link>

      <div className="mt-6">
        {loading ? (
          <ViewerSkeleton />
        ) : error ? (
          <EmptyState
            icon={<DocIcon />}
            title="Couldn't load the article"
            description={error}
            action={<Button onClick={refetch}>Try again</Button>}
          />
        ) : !article ? (
          <NotFound id={id} />
        ) : (
          <Article article={article} />
        )}
      </div>
    </div>
  )
}

function Article({ article }) {
  const hasContent = Boolean(article.finalMarkdown?.trim())

  return (
    <article>
      <ArticleHeader article={article} hasContent={hasContent} />

      {hasContent ? (
        <div className="mt-8">
          <Markdown>{article.finalMarkdown}</Markdown>
        </div>
      ) : (
        <p className="mt-8 rounded-sm border border-hairline bg-soft-stone/40 px-4 py-6 text-center text-body text-body-muted">
          This run didn't produce article content{article.status === 'failed' ? ' — it failed before publishing.' : '.'}
        </p>
      )}

      {article.sources?.length > 0 && <References sources={article.sources} />}

      <div className="mt-10">
        <EvaluationPanel evaluation={article.evaluation} />
      </div>
    </article>
  )
}

function ArticleHeader({ article, hasContent }) {
  return (
    <header className="border-b border-hairline pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusChip tone={statusTone(article.status)}>{article.status}</StatusChip>
        {article.evaluation?.overallScore != null && (
          <span className="mono-label">score {article.evaluation.overallScore}/100</span>
        )}
        {article.metrics?.totalTokens > 0 && (
          <span className="text-caption text-muted">
            {formatNumber(article.metrics.totalTokens)} tokens · {formatCost(article.metrics.totalCostUsd)}
          </span>
        )}
      </div>

      <h1 className="mt-4 font-display text-section-heading text-ink">{article.title || article.topic}</h1>

      <Link
        to={`/dashboard?id=${article.id}`}
        className="mt-2 inline-block text-caption text-action-blue underline underline-offset-2 hover:text-focus-blue"
      >
        View pipeline run →
      </Link>

      {article.metaDescription && (
        <p className="mt-3 text-body-large text-body-muted">{article.metaDescription}</p>
      )}

      {article.seo?.keywords?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {article.seo.keywords.map((kw) => (
            <li key={kw} className="rounded-xl border border-coral-soft px-2.5 py-0.5 text-micro text-coral">
              {kw}
            </li>
          ))}
        </ul>
      )}

      {hasContent && <ExportActions article={article} />}
    </header>
  )
}

function ExportActions({ article }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(article.finalMarkdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <Button as="a" href={articlesApi.exportUrl(article.id)} download size="sm">
        Download .md
      </Button>
      <Button variant="secondary" onClick={copy}>
        {copied ? 'Copied' : 'Copy markdown'}
      </Button>
    </div>
  )
}

function References({ sources }) {
  return (
    <section className="mt-10 border-t border-hairline pt-6" aria-label="References">
      <h2 className="font-display text-feature-heading text-ink">References</h2>
      <ol className="mt-4 flex flex-col gap-3">
        {sources.map((s, i) => (
          <li key={s.url || i} className="text-caption">
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-action-blue underline underline-offset-2 hover:text-focus-blue"
            >
              {s.title || s.url}
            </a>
            {s.publisher && <span className="text-body-muted"> — {s.publisher}</span>}
            {s.published_date && <span className="text-muted"> ({s.published_date})</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}

function NotFound({ id }) {
  return (
    <EmptyState
      icon={<DocIcon />}
      title="Article not found"
      description={`No article is stored for "${id}". It may have been deleted.`}
      action={<Button as={Link} to="/history">Back to history</Button>}
    />
  )
}

function ViewerSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading article">
      <div className="h-5 w-24 rounded-full bg-soft-stone" />
      <div className="mt-4 h-9 w-3/4 rounded-sm bg-soft-stone" />
      <div className="mt-3 h-4 w-2/3 rounded-xs bg-soft-stone" />
      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 rounded-xs bg-soft-stone" style={{ width: `${90 - i * 6}%` }} />
        ))}
      </div>
    </div>
  )
}

function DocIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <path d="M11 4h12l6 6v26H11z" strokeLinejoin="round" />
      <path d="M23 4v6h6M16 20h10M16 26h10M16 14h5" strokeLinecap="round" />
    </svg>
  )
}
