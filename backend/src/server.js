import app from './app.js'
import { config } from './config/index.js'
import { initDb } from './database/pool.js'
import { logger } from './utils/logger.js'

// Boot: connect DB (or fall back to in-memory), then listen.
async function start() {
  await initDb()
  app.listen(config.port, () => {
    logger.info(`Backend listening on http://localhost:${config.port} (${config.env})`)
  })
}

start().catch((err) => {
  logger.error('Failed to start server', { message: err.message })
  process.exit(1)
})
