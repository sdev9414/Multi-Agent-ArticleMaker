import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/apiResponse.js'
import { articleService } from '../services/articleService.js'

// Thin controllers: parse request → call service → shape response. No business logic here.
export const articleController = {
  create: asyncHandler(async (req, res) => {
    const article = await articleService.createArticle(req.body)
    return created(res, { data: article, message: 'Article created' })
  }),

  list: asyncHandler(async (_req, res) => {
    const articles = await articleService.listArticles()
    return ok(res, { data: articles, message: 'Articles retrieved' })
  }),

  getOne: asyncHandler(async (req, res) => {
    const article = await articleService.getArticle(req.params.id)
    return ok(res, { data: article, message: 'Article retrieved' })
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await articleService.deleteArticle(req.params.id)
    return ok(res, { data: result, message: 'Article deleted' })
  }),

  // File download — intentionally bypasses the JSON envelope (returns text/markdown).
  export: asyncHandler(async (req, res) => {
    const { filename, markdown } = await articleService.exportArticle(req.params.id)
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.send(markdown)
  }),
}
