import { articleRepository } from '../repositories/articleRepository.js'
import { aiWorkflowService } from './aiWorkflowService.js'
import { notFound } from '../utils/AppError.js'
import { logger } from '../utils/logger.js'

// Business logic for articles. Controllers stay thin; this layer owns the rules and
// orchestrates the AI workflow (Express → FastAPI) before persisting the result.
export const articleService = {
  async createArticle({ topic, articleType, audience }) {
    // 1. Persist a pending row so the run is tracked even if the pipeline fails.
    const article = await articleRepository.create({ topic, articleType, audience })

    try {
      // 2. Run the full agent pipeline via the AI service.
      const result = await aiWorkflowService.runWorkflow({ topic, articleType, audience })
      // 3. Persist the enriched output and return the saved article.
      const saved = await articleRepository.saveResult(article.id, result)
      logger.info('Article generated', { id: article.id, status: saved.status })
      return saved
    } catch (err) {
      await articleRepository.markFailed(article.id, err.message)
      logger.error('Article generation failed', { id: article.id, message: err.message })
      throw err
    }
  },

  listArticles() {
    return articleRepository.findAll()
  },

  async getArticle(id) {
    const article = await articleRepository.findById(id)
    if (!article) throw notFound(`Article ${id} not found`)
    return article
  },

  // Build a downloadable markdown file (filename + content) for an article.
  async exportArticle(id) {
    const article = await this.getArticle(id)
    const markdown =
      article.finalMarkdown?.trim() ||
      `# ${article.title || article.topic}\n\n_No article content was generated for this run._`
    const slug = article.slug || slugify(article.title || article.topic)
    return { filename: `${slug}.md`, markdown }
  },

  async deleteArticle(id) {
    const removed = await articleRepository.remove(id)
    if (!removed) throw notFound(`Article ${id} not found`)
    return { id }
  },
}

// URL/file-safe slug from a title or topic.
function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'article'
  )
}
