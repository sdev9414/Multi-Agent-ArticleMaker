import { badRequest } from '../utils/AppError.js'

const ARTICLE_TYPES = ['News report', 'Explainer', 'Analysis', 'How-to guide', 'Opinion']
const AUDIENCES = ['General public', 'Industry professionals', 'Executives', 'Developers', 'Students']

// Validates + normalizes the create-article body. Throws AppError(400) on bad input.
export function validateCreateArticle(req, _res, next) {
  const { topic, articleType, audience } = req.body ?? {}
  const errors = {}

  if (typeof topic !== 'string' || topic.trim().length < 8) {
    errors.topic = 'Topic must be at least 8 characters.'
  } else if (topic.trim().length > 200) {
    errors.topic = 'Topic must be 200 characters or fewer.'
  }

  if (articleType !== undefined && !ARTICLE_TYPES.includes(articleType)) {
    errors.articleType = `Article type must be one of: ${ARTICLE_TYPES.join(', ')}.`
  }
  if (audience !== undefined && !AUDIENCES.includes(audience)) {
    errors.audience = `Audience must be one of: ${AUDIENCES.join(', ')}.`
  }

  if (Object.keys(errors).length > 0) {
    return next(badRequest('Validation failed', errors))
  }

  // Normalize with defaults so downstream layers receive complete data.
  req.body = {
    topic: topic.trim(),
    articleType: articleType ?? ARTICLE_TYPES[0],
    audience: audience ?? AUDIENCES[0],
  }
  next()
}
