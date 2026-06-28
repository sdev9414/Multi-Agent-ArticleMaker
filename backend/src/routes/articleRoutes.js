import { Router } from 'express'
import { articleController } from '../controllers/articleController.js'
import { validateCreateArticle } from '../middleware/validateArticle.js'

const router = Router()

// /articles — CRUD. Routes only wire middleware → controller; no logic here.
router.post('/', validateCreateArticle, articleController.create)
router.get('/', articleController.list)
router.get('/:id', articleController.getOne)
router.get('/:id/export', articleController.export)
router.delete('/:id', articleController.remove)

export default router
