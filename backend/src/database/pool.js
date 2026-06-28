import mysql from 'mysql2/promise'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

// MySQL pool. If MYSQL_URL is unset or unreachable, `pool` stays null and the
// repository falls back to an in-memory store (Phase 2 runs without a DB).
let pool = null

export async function initDb() {
  if (!config.mysqlUrl) {
    logger.warn('MYSQL_URL not set — using in-memory store (no persistence).')
    return null
  }
  try {
    pool = mysql.createPool(config.mysqlUrl)
    await pool.query('SELECT 1')
    logger.info('MySQL connected.')
    return pool
  } catch (err) {
    logger.warn(`MySQL unavailable (${err.message}) — using in-memory store.`)
    pool = null
    return null
  }
}

export const getPool = () => pool
