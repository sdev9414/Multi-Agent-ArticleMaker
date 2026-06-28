// Minimal structured logger. Logs to stdout/stderr with a timestamp and level.
// ponytail: console-based; swap for pino if structured log shipping is ever needed.
const stamp = () => new Date().toISOString()

export const logger = {
  info: (msg, meta) => console.log(`[${stamp()}] INFO  ${msg}`, meta ?? ''),
  warn: (msg, meta) => console.warn(`[${stamp()}] WARN  ${msg}`, meta ?? ''),
  error: (msg, meta) => console.error(`[${stamp()}] ERROR ${msg}`, meta ?? ''),
}
