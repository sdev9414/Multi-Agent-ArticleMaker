import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/apiResponse.js'
import { aiWorkflowService } from '../services/aiWorkflowService.js'

// Exposes the live, read-only runtime config for the Settings surface.
// Secrets are never included — only which provider/model is active and whether
// the AI service is reachable.
export const configController = {
  get: asyncHandler(async (_req, res) => {
    const ai = await aiWorkflowService.getStatus()
    return ok(res, {
      data: {
        aiService: ai,
      },
      message: 'Configuration retrieved',
    })
  }),
}
