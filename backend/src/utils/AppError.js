// Typed application error so controllers/services can signal HTTP status without
// each layer re-deciding it. The global error handler reads `status`.
export class AppError extends Error {
  constructor(message, status = 500, details = null) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.details = details
  }
}

export const badRequest = (msg, details) => new AppError(msg, 400, details)
export const notFound = (msg = 'Resource not found') => new AppError(msg, 404)
