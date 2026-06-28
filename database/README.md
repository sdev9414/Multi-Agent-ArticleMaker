# Database

MySQL schema for Multi-Agent Newsroom.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Table definitions, indexes, foreign keys. Idempotent (`CREATE TABLE IF NOT EXISTS`). |
| `seed.sql` | Default user + one example completed article for local dev. |

## Setup

```bash
mysql -u root -p -e "CREATE DATABASE newsroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p newsroom < database/schema.sql
mysql -u root -p newsroom < database/seed.sql   # optional
```

Then point the backend and AI service at it:

```
MYSQL_URL=mysql://user:password@localhost:3306/newsroom
```

If `MYSQL_URL` is unset, the backend runs against an in-memory store — useful for a quick local demo without MySQL.

## Tables

```
users ──< articles ──< sources
                   ├──< agent_runs
                   ├──< evaluations
                   └──< article_versions
```

- **users** — accounts. Auth is a future feature; a seeded default user owns early rows. `user_id` on articles is nullable and `ON DELETE SET NULL`.
- **articles** — one row per run. `status` ∈ `pending|running|completed|failed`. Final outputs (title, slug, meta, markdown) and `seo` JSON are filled by the SEO/Publisher agents.
- **sources** — research sources per article. `ON DELETE CASCADE`.
- **agent_runs** — per-agent observability: latency, token counts, cost, retries, error. Powers the dashboard.
- **evaluations** — Evaluator scores (0–100) plus a JSON `issues` array.
- **article_versions** — markdown snapshots for version comparison (future feature).

## Indexes

Chosen for the common queries:

- `articles(status)`, `articles(created_at)` — History list + status filter.
- `articles(slug)` — lookups / export filenames.
- `sources(article_id)`, `agent_runs(article_id)`, `evaluations(article_id)` — join by article.
- `agent_runs(agent)` — per-agent analytics.

## Conventions

- UUIDs as `CHAR(36)` primary keys (generated app-side).
- `utf8mb4` everywhere for full Unicode.
- JSON columns for flexible, non-relational blobs (`seo`, `issues`).
- `created_at` / `updated_at` managed by MySQL defaults.
