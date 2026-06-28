import { fail } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'
import { logger } from '../utils/logger.js'

// 404 for unmatched routes.
export function notFoundHandler(req, res) {
  return fail(res, { status: 404, message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Global error handler. Known AppErrors return their status + details; everything
// else is logged and returned as a generic 500 (never leak internals).
// eslint-disable-next-line no-unused-vars -- Express requires 4-arg signature.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return fail(res, { status: err.status, message: err.message, error: err.details })
  }
  logger.error('Unhandled error', { message: err.message, stack: err.stack })
  return fail(res, { status: 500, message: 'Internal server error' })
}
