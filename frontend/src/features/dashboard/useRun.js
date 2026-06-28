import { useCallback, useEffect, useState } from 'react'
import { articlesApi } from '../../services/articles'

/**
 * Load a single run's full detail for the dashboard.
 * Resolves the run to show as: the explicit `id`, else the most recent article.
 * Returns { run, loading, error, refetch }.
 */
export function useRun(id) {
  const [run, setRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const targetId = id ?? (await latestId())
      if (!targetId) {
        setRun(null)
        return
      }
      setRun(await articlesApi.getById(targetId))
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not load the run.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { run, loading, error, refetch: load }
}

async function latestId() {
  const list = await articlesApi.list()
  return list?.[0]?.id ?? null
}
