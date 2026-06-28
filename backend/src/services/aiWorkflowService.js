import { config } from '../config/index.js'
import { AppError } from '../utils/AppError.js'
import { logger } from '../utils/logger.js'

// The ONLY place Express talks to the FastAPI AI service. Isolating the call here
// means the rest of the backend is unaffected by how the workflow is reached.
const WORKFLOW_RUN_PATH = '/workflow/run'

/**
 * Run the full agent pipeline via FastAPI and return the WorkflowResult (snake_case).
 * Throws AppError(502) when the AI service is unreachable, times out, or errors.
 */
async function runWorkflow({ topic, articleType, audience }) {
  const url = `${config.fastapiUrl}${WORKFLOW_RUN_PATH}`
  const body = JSON.stringify({ topic, article_type: articleType, audience })

  const response = await postJson(url, body)
  const payload = await response.json().catch(() => null)

  // FastAPI uses the same { success, message, data, error } envelope. A failed run
  // still returns success:true with data.status === 'failed'; only envelope-level
  // failures (success:false) are thrown here.
  if (!payload || payload.success !== true || !payload.data) {
    const detail = payload?.error ?? payload?.message ?? `HTTP ${response.status}`
    logger.error('AI service returned an error', { url, status: response.status, detail })
    throw new AppError('AI workflow failed', 502, detail)
  }
  return payload.data
}

async function postJson(url, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.aiTimeoutMs)
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    })
  } catch (err) {
    const reason = err.name === 'AbortError' ? `timed out after ${config.aiTimeoutMs}ms` : err.message
    logger.error('AI service request failed', { url, reason })
    throw new AppError(`AI service unavailable: ${reason}`, 502)
  } finally {
    clearTimeout(timer)
  }
}

export const aiWorkflowService = { runWorkflow, getStatus }

/**
 * Report the AI service's live config + reachability for the Settings surface.
 * Never throws — returns { reachable:false } when the service is down.
 */
async function getStatus() {
  const url = `${config.fastapiUrl}/health`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    const payload = await response.json().catch(() => null)
    const data = payload?.data ?? {}
    return { reachable: true, provider: data.provider ?? null, model: data.model ?? null }
  } catch (err) {
    logger.warn('AI service health check failed', { url, message: err.message })
    return { reachable: false, provider: null, model: null }
  } finally {
    clearTimeout(timer)
  }
}
