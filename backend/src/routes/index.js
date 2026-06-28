import { Router } from 'express'
import articleRoutes from './articleRoutes.js'
import { configController } from '../controllers/configController.js'
import { ok } from '../utils/apiResponse.js'

const router = Router()

// Health check — used by deploy targets and the frontend connectivity check.
router.get('/health', (_req, res) => ok(res, { data: { status: 'up' }, message: 'Healthy' }))

// Live, read-only runtime config (active provider/model + AI service reachability).
router.get('/config', configController.get)

router.use('/articles', articleRoutes)

export default router
