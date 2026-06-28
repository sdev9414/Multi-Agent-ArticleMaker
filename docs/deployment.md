# Deployment

Three services deploy independently. Targets below are the reference setup; any
equivalent host works.

| Service | Target | Why |
|---------|--------|-----|
| Frontend | **Vercel** | static SPA + CDN |
| Backend (Express) | **Render** (web service) | Node API gateway |
| AI service (FastAPI) | **Render** (web service) | Python + LangGraph |
| Database | **Railway MySQL** | managed MySQL |

Deploy order: **MySQL → AI service → Backend → Frontend** (each needs the URL of the one before it).

---

## 1. MySQL (Railway)

1. Create a MySQL database on Railway.
2. Copy its connection string (`mysql://user:pass@host:port/dbname`).
3. Load the schema: run `database/schema.sql` against the database (Railway query console
   or `mysql < database/schema.sql`). Optionally `database/seed.sql`.

> Without `MYSQL_URL`, the backend runs on an in-memory store — fine for demos, but data is
> lost on restart. Use MySQL for any persistent deployment.

## 2. AI service (Render)

- **Root directory:** `ai-service`
- **Build:** `pip install -r requirements.txt`
- **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment:**

  | Var | Example | Notes |
  |-----|---------|-------|
  | `LLM_PROVIDER` | `gemini` | `openai` \| `gemini` \| `mock` |
  | `GEMINI_API_KEY` | `AIza…` | required for `gemini` |
  | `GEMINI_MODEL` | `gemini-2.5-flash` | generous free-tier quota |
  | `OPENAI_API_KEY` / `OPENAI_MODEL` | | required for `openai` |
  | `TAVILY_API_KEY` | | optional; mock search without it |

  Render sets `PORT`; the start command binds to it. Copy the resulting public URL.

## 3. Backend (Render)

- **Root directory:** `backend`
- **Build:** `npm install`
- **Start:** `npm start`
- **Environment:**

  | Var | Example | Notes |
  |-----|---------|-------|
  | `NODE_ENV` | `production` | |
  | `MYSQL_URL` | `mysql://…` | from Railway |
  | `FASTAPI_URL` | `https://<ai-service>.onrender.com` | from step 2 |
  | `AI_TIMEOUT_MS` | `300000` | generous for full runs |
  | `JWT_SECRET` | random string | reserved for auth |

  Copy the backend's public URL.

## 4. Frontend (Vercel)

- **Root directory:** `frontend`
- **Build:** `npm run build` → output `dist`
- **Routing:** SPA rewrite all routes to `/index.html`.
- **API base:** the app calls `/api/*`. In production, point `/api` at the backend, either by:
  - a Vercel rewrite: `{ "source": "/api/:path*", "destination": "https://<backend>.onrender.com/api/:path*" }`, or
  - setting an API base URL env var and rebuilding (see `src/services/api.js`).

  In local dev, `vite.config.js` proxies `/api` → `http://localhost:4000`.

---

## Production checklist

- [ ] Schema loaded; `MYSQL_URL` set on the backend.
- [ ] Real `LLM_PROVIDER` + key set on the AI service (not `mock`).
- [ ] `FASTAPI_URL` on the backend points at the deployed AI service (HTTPS).
- [ ] Frontend `/api` routed to the backend.
- [ ] CORS: the AI service allows the backend; the backend allows the frontend origin.
- [ ] Secrets only in host env vars — never committed (`.env` is gitignored).
- [ ] Health checks green: `GET /api/health`, `GET /health`, `GET /api/config`.

## Notes & limits

- **Cold starts:** free Render tiers sleep; the first request can be slow. The backend's
  `AI_TIMEOUT_MS` (300s) absorbs this.
- **Gemini free tier:** ~20 requests/day (about 3 full runs). Use a paid key for real
  traffic, or `LLM_PROVIDER=mock` for unlimited demo runs.
- **Scaling status:** run status is cached in-process. For multiple AI-service instances,
  back it with Redis/DB.
