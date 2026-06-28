import { useCallback, useEffect, useState } from 'react'
import { articlesApi } from '../../services/articles'

/** Load a single article's full detail by id. Returns { article, loading, error, refetch }. */
export function useArticle(id) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setArticle(await articlesApi.getById(id))
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not load this article.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { article, loading, error, refetch: load }
}
