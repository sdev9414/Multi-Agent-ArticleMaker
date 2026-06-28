# API Reference

Two services. The **Express backend** (`/api`, default `:4000`) is the gateway the
frontend talks to. The **FastAPI AI service** (default `:8010`) is called only by the
backend.

All JSON responses use the standard envelope:

```json
{ "success": true, "message": "string", "data": {}, "error": null }
```

On error, `success` is `false`, `data` is `null`, and `error` holds details (a string or
a field-keyed object for validation errors).

---

## Express backend — `/api`

### `GET /api/health`
Liveness check.
```json
{ "success": true, "message": "Healthy", "data": { "status": "up" }, "error": null }
```

### `GET /api/config`
Live runtime config (no secrets). Reports the active provider/model and whether the AI
service is reachable.
```json
{ "success": true, "message": "Configuration retrieved",
  "data": { "aiService": { "reachable": true, "provider": "gemini", "model": "gemini-2.5-flash" } },
  "error": null }
```

### `POST /api/articles`
Create an article: validates input, runs the full agent pipeline via the AI service, and
persists the result. **Synchronous** — responds when the run completes (can take 30–90s).

Request:
```json
{ "topic": "string (8–200 chars)", "articleType": "Explainer", "audience": "General public" }
```
- `articleType` ∈ `News report | Explainer | Analysis | How-to guide | Opinion`
- `audience` ∈ `General public | Industry professionals | Executives | Developers | Students`

Response `201` — `data` is the enriched article (see [Article shape](#article-shape)).
Validation errors return `400` with `error` as a field-keyed object. AI failures return `502`.

### `GET /api/articles`
List saved articles (summaries), newest first.
```json
{ "success": true, "message": "Articles retrieved",
  "data": [ { "id": "uuid", "topic": "...", "articleType": "Explainer",
              "audience": "General public", "status": "completed",
              "title": "...", "overallScore": 85, "createdAt": "ISO-8601" } ],
  "error": null }
```

### `GET /api/articles/:id`
Full article detail. `404` if not found. See [Article shape](#article-shape).

### `GET /api/articles/:id/export`
Download the article as markdown. **Not** a JSON envelope:
- `200`, `Content-Type: text/markdown; charset=utf-8`
- `Content-Disposition: attachment; filename="<slug>.md"`
- Body: the final markdown.

### `DELETE /api/articles/:id`
Delete an article. `404` if not found.
```json
{ "success": true, "message": "Article deleted", "data": { "id": "uuid" }, "error": null }
```

---

### Article shape

```json
{
  "id": "uuid",
  "topic": "string", "articleType": "Explainer", "audience": "General public",
  "status": "completed | failed | pending",
  "createdAt": "ISO-8601",
  "title": "string", "slug": "string", "metaDescription": "string",
  "finalMarkdown": "string",
  "seo": { "title": "", "metaDescription": "", "slug": "", "keywords": [], "headings": [] },
  "sources": [ { "title": "", "url": "", "snippet": "", "publisher": "", "published_date": "", "credibility_notes": "" } ],
  "researchNotes": [], "verifiedClaims": [], "outline": "", "draft": "",
  "evaluation": { "factuality": 0, "citationQuality": 0, "readability": 0,
                  "completeness": 0, "seoQuality": 0, "overallScore": 0, "issues": [] },
  "agentRuns": [ { "agent": "research", "status": "completed", "latencyMs": 0,
                   "tokensInput": 0, "tokensOutput": 0, "costUsd": 0, "retries": 0, "error": null } ],
  "errors": [],
  "metrics": { "totalTokens": 0, "totalCostUsd": 0, "durationMs": 0, "model": "", "provider": "" }
}
```

---

## FastAPI AI service

Called by the backend only. Base URL = `FASTAPI_URL` (default `http://localhost:8010`).

### `GET /health`
```json
{ "success": true, "message": "Healthy",
  "data": { "status": "up", "provider": "gemini", "model": "gemini-2.5-flash" }, "error": null }
```

### `POST /workflow/run`
Run the full pipeline. Request:
```json
{ "topic": "string", "article_type": "Explainer", "audience": "General public" }
```
Response `200` (completed) or `502` (failed but with partial data); `data` is the
`WorkflowResult` (snake_case equivalent of the article shape above plus `total_tokens`,
`total_cost_usd`, `duration_ms`).

### `GET /workflow/status/{run_id}`
Returns a cached run by id, or `404` if unknown.
