import { api } from './api'

// Article API calls. The response interceptor already unwraps to the
// { success, message, data, error } envelope, so each call returns `.data`.

// A full pipeline run (six LLM calls) can take a while — override the default timeout.
const RUN_TIMEOUT_MS = 300000

export const articlesApi = {
  async create({ topic, articleType, audience }) {
    const res = await api.post('/articles', { topic, articleType, audience }, { timeout: RUN_TIMEOUT_MS })
    return res.data
  },

  async list() {
    const res = await api.get('/articles')
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/articles/${id}`)
    return res.data
  },

  async remove(id) {
    const res = await api.delete(`/articles/${id}`)
    return res.data
  },

  // Direct (non-JSON) URL the browser can hit to download the markdown file.
  exportUrl(id) {
    return `/api/articles/${id}/export`
  },
}

// Live runtime config (active provider/model + AI service reachability).
export async function getConfig() {
  const res = await api.get('/config')
  return res.data
}
