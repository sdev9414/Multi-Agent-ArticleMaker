import { useCallback, useEffect, useState } from 'react'
import { articlesApi } from '../../services/articles'

/**
 * Load the saved-article list and expose a delete action.
 * Returns { articles, loading, error, refetch, remove, removingId }.
 */
export function useArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setArticles(await articlesApi.list())
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not load your history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const remove = useCallback(async (id) => {
    setRemovingId(id)
    try {
      await articlesApi.remove(id)
      setArticles((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not delete that article.')
    } finally {
      setRemovingId(null)
    }
  }, [])

  return { articles, loading, error, refetch: load, remove, removingId }
}
