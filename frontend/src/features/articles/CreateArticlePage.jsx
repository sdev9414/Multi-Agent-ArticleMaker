import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { articlesApi } from '../../services/articles'

const ARTICLE_TYPES = ['News report', 'Explainer', 'Analysis', 'How-to guide', 'Opinion']
const AUDIENCES = ['General public', 'Industry professionals', 'Executives', 'Developers', 'Students']

const EMPTY = { topic: '', articleType: ARTICLE_TYPES[0], audience: AUDIENCES[0] }

export default function CreateArticlePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function validate() {
    const next = {}
    const topic = form.topic.trim()
    if (topic.length < 8) next.topic = 'Give the topic at least 8 characters so research has something to work with.'
    if (topic.length > 200) next.topic = 'Keep the topic under 200 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const article = await articlesApi.create({
        topic: form.topic.trim(),
        articleType: form.articleType,
        audience: form.audience,
      })
      navigate(`/dashboard?id=${article.id}`)
    } catch (err) {
      setSubmitError(typeof err === 'string' ? err : 'The pipeline could not complete. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h2 className="font-display text-section-heading text-ink">Create an article</h2>
        <p className="mt-2 max-w-prose text-body text-body-muted">
          Describe the topic and who it's for. The agent pipeline handles research, fact-checking,
          editing, SEO, and publishing.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-hairline bg-canvas p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <Field
            as="textarea"
            id="topic"
            label="Topic"
            rows={3}
            placeholder="e.g. The impact of solid-state batteries on electric vehicle range"
            value={form.topic}
            onChange={set('topic')}
            error={errors.topic}
            hint="Be specific. A focused topic produces stronger research."
            disabled={submitting}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Field as="select" id="articleType" label="Article type" value={form.articleType} onChange={set('articleType')} disabled={submitting}>
              {ARTICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </Field>
            <Field as="select" id="audience" label="Audience" value={form.audience} onChange={set('audience')} disabled={submitting}>
              {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
            </Field>
          </div>
        </div>

        {submitting && (
          <p className="mt-6 text-caption text-body-muted" role="status">
            Running the agent pipeline — research, fact-checking, editing, SEO, publishing, and evaluation.
            This can take a minute.
          </p>
        )}

        {submitError && (
          <p className="mt-6 rounded-xs border border-error/30 bg-error/5 px-3.5 py-2.5 text-caption text-error" role="alert">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex items-center gap-5 border-t border-hairline pt-6">
          <Button type="submit" loading={submitting}>
            {submitting ? 'Generating…' : 'Start the pipeline'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => { setForm(EMPTY); setErrors({}); setSubmitError(null) }}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}
