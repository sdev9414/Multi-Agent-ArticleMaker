import { randomUUID } from 'node:crypto'
import { getPool } from '../database/pool.js'

// Article persistence. Uses MySQL when a pool exists, otherwise an in-memory Map
// so the API is fully functional without a database. Both paths return the same
// normalized (camelCase) shapes, so callers never branch on the storage backend.
const memory = new Map()

// ── shape helpers ───────────────────────────────────────────────────────────

// A list-row summary (History / dashboards).
function toSummary(a) {
  return {
    id: a.id,
    topic: a.topic,
    articleType: a.articleType,
    audience: a.audience,
    status: a.status,
    title: a.title ?? null,
    overallScore: a.evaluation?.overallScore ?? null,
    createdAt: a.createdAt,
  }
}

// Convert a FastAPI WorkflowResult (snake_case) into the stored detail record.
function normalize(base, result) {
  const seo = result.seo ?? {}
  const ev = result.evaluation ?? {}
  return {
    id: base.id,
    topic: result.topic ?? base.topic,
    articleType: result.article_type ?? base.articleType,
    audience: result.audience ?? base.audience,
    status: result.status ?? 'completed',
    createdAt: base.createdAt,
    title: seo.title || null,
    slug: seo.slug || null,
    metaDescription: seo.meta_description || null,
    finalMarkdown: result.final_article ?? '',
    seo: {
      title: seo.title ?? '',
      metaDescription: seo.meta_description ?? '',
      slug: seo.slug ?? '',
      keywords: seo.keywords ?? [],
      headings: seo.headings ?? [],
    },
    sources: result.sources ?? [],
    researchNotes: result.research_notes ?? [],
    verifiedClaims: result.verified_claims ?? [],
    outline: result.outline ?? '',
    draft: result.draft ?? '',
    evaluation: {
      factuality: ev.factuality ?? 0,
      citationQuality: ev.citation_quality ?? 0,
      readability: ev.readability ?? 0,
      completeness: ev.completeness ?? 0,
      seoQuality: ev.seo_quality ?? 0,
      overallScore: ev.overall_score ?? 0,
      issues: ev.issues ?? [],
    },
    agentRuns: (result.agent_runs ?? []).map((r) => ({
      agent: r.agent,
      status: r.status,
      latencyMs: r.latency_ms ?? 0,
      tokensInput: r.tokens_input ?? 0,
      tokensOutput: r.tokens_output ?? 0,
      costUsd: r.cost_usd ?? 0,
      retries: r.retries ?? 0,
      error: r.error ?? null,
    })),
    errors: result.errors ?? [],
    metrics: {
      totalTokens: result.total_tokens ?? 0,
      totalCostUsd: result.total_cost_usd ?? 0,
      durationMs: result.duration_ms ?? 0,
      model: result.model ?? '',
      provider: result.provider ?? '',
    },
  }
}

export const articleRepository = {
  async create({ topic, articleType, audience }) {
    const pool = getPool()
    const row = {
      id: randomUUID(),
      topic,
      articleType,
      audience,
      status: 'pending',
      title: null,
      evaluation: null,
      createdAt: new Date().toISOString(),
    }
    if (pool) {
      await pool.query(
        'INSERT INTO articles (id, topic, article_type, audience, status) VALUES (?, ?, ?, ?, ?)',
        [row.id, row.topic, row.articleType, row.audience, row.status]
      )
    } else {
      memory.set(row.id, row)
    }
    return toSummary(row)
  },

  // Persist a completed/failed workflow result and return the full detail record.
  async saveResult(id, result) {
    const pool = getPool()
    const fallback = { id, topic: result.topic, articleType: result.article_type, audience: result.audience, createdAt: new Date().toISOString() }
    const base = (await baseRow(id)) ?? fallback
    const detail = normalize(base, result)

    if (pool) {
      await persistDetail(pool, detail)
    } else {
      memory.set(id, detail)
    }
    return detail
  },

  async markFailed(id, message) {
    const pool = getPool()
    if (pool) {
      await pool.query('UPDATE articles SET status = ?, error = ? WHERE id = ?', ['failed', message ?? null, id])
      return
    }
    const existing = memory.get(id)
    if (existing) memory.set(id, { ...existing, status: 'failed', errors: [message] })
  },

  async findAll() {
    const pool = getPool()
    if (pool) {
      const [rows] = await pool.query(
        `SELECT a.id, a.topic, a.article_type AS articleType, a.audience, a.status,
                a.title, a.created_at AS createdAt, e.overall_score AS overallScore
           FROM articles a
           LEFT JOIN evaluations e ON e.article_id = a.id
          ORDER BY a.created_at DESC`
      )
      return rows
    }
    return [...memory.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toSummary)
  },

  async findById(id) {
    const pool = getPool()
    if (pool) return readDetail(pool, id)
    return memory.get(id) ?? null
  },

  async remove(id) {
    const pool = getPool()
    if (pool) {
      const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [id])
      return result.affectedRows > 0
    }
    return memory.delete(id)
  },
}

// Internal: fetch the minimal base fields for an existing row (id/topic/created).
async function baseRow(id) {
  const pool = getPool()
  if (!pool) {
    const m = memory.get(id)
    return m ? { id: m.id, topic: m.topic, articleType: m.articleType, audience: m.audience, createdAt: m.createdAt } : null
  }
  const [rows] = await pool.query(
    'SELECT id, topic, article_type AS articleType, audience, created_at AS createdAt FROM articles WHERE id = ?',
    [id]
  )
  return rows[0] ?? null
}

// ── MySQL persistence (only used when a pool is configured) ──────────────────

async function persistDetail(pool, d) {
  await pool.query(
    `UPDATE articles
        SET status = ?, title = ?, slug = ?, meta_description = ?, final_markdown = ?, seo = ?, error = ?
      WHERE id = ?`,
    [
      d.status,
      d.title,
      d.slug,
      d.metaDescription,
      d.finalMarkdown,
      JSON.stringify(d.seo),
      d.errors.length ? d.errors.join('; ') : null,
      d.id,
    ]
  )

  // Replace child rows so re-runs stay idempotent.
  await pool.query('DELETE FROM sources WHERE article_id = ?', [d.id])
  for (const s of d.sources) {
    await pool.query(
      `INSERT INTO sources (id, article_id, title, url, snippet, publisher, published_date, credibility_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), d.id, s.title ?? null, s.url, s.snippet ?? null, s.publisher ?? null, s.published_date ?? null, s.credibility_notes ?? null]
    )
  }

  await pool.query('DELETE FROM agent_runs WHERE article_id = ?', [d.id])
  for (const r of d.agentRuns) {
    await pool.query(
      `INSERT INTO agent_runs (id, article_id, agent, status, latency_ms, tokens_input, tokens_output, cost_usd, retries, error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), d.id, r.agent, r.status, r.latencyMs, r.tokensInput, r.tokensOutput, r.costUsd, r.retries, r.error]
    )
  }

  await pool.query('DELETE FROM evaluations WHERE article_id = ?', [d.id])
  const e = d.evaluation
  await pool.query(
    `INSERT INTO evaluations (id, article_id, factuality, citation_quality, readability, completeness, seo_quality, overall_score, issues)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), d.id, e.factuality, e.citationQuality, e.readability, e.completeness, e.seoQuality, e.overallScore, JSON.stringify(e.issues)]
  )
}

async function readDetail(pool, id) {
  const [articleRows] = await pool.query(
    `SELECT id, topic, article_type AS articleType, audience, status, title, slug,
            meta_description AS metaDescription, final_markdown AS finalMarkdown, seo, error,
            created_at AS createdAt
       FROM articles WHERE id = ?`,
    [id]
  )
  const row = articleRows[0]
  if (!row) return null

  const [sources] = await pool.query(
    'SELECT title, url, snippet, publisher, published_date, credibility_notes FROM sources WHERE article_id = ? ORDER BY created_at',
    [id]
  )
  const [agentRuns] = await pool.query(
    `SELECT agent, status, latency_ms AS latencyMs, tokens_input AS tokensInput,
            tokens_output AS tokensOutput, cost_usd AS costUsd, retries, error
       FROM agent_runs WHERE article_id = ? ORDER BY created_at`,
    [id]
  )
  const [evalRows] = await pool.query(
    `SELECT factuality, citation_quality AS citationQuality, readability, completeness,
            seo_quality AS seoQuality, overall_score AS overallScore, issues
       FROM evaluations WHERE article_id = ? ORDER BY created_at DESC LIMIT 1`,
    [id]
  )
  const ev = evalRows[0] ?? {}

  return {
    ...row,
    seo: parseJson(row.seo, {}),
    sources,
    agentRuns,
    evaluation: { ...ev, issues: parseJson(ev.issues, []) },
    errors: row.error ? [row.error] : [],
  }
}

function parseJson(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'object') return value // mysql2 may already parse JSON columns
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
