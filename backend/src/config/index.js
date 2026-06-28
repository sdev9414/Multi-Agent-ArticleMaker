import dotenv from 'dotenv'

dotenv.config()

// Single source of truth for environment config. Fail loud on missing critical vars later;
// for Phase 2 everything has a safe local default so the app boots without a .env.
export const config = {
  port: Number(process.env.PORT) || 4000,
  env: process.env.NODE_ENV || 'development',
  mysqlUrl: process.env.MYSQL_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  fastapiUrl: process.env.FASTAPI_URL || 'http://localhost:8000',
  // A full agent run (six real LLM calls) can take a while — allow a generous wait.
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 300000,
}

export const isProd = config.env === 'production'
