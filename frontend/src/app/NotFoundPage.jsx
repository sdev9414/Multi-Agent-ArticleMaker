import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <p className="mono-label text-deep-green">404</p>
      <h1 className="mt-4 font-display text-section-display text-ink">Page not found</h1>
      <p className="mt-3 max-w-prose text-body-large text-body-muted">
        That page doesn't exist. Head back to the dashboard or start a new article.
      </p>
      <div className="mt-8 flex items-center gap-5">
        <Button as={Link} to="/dashboard">Go to dashboard</Button>
        <Button as={Link} to="/" variant="secondary">Home</Button>
      </div>
    </div>
  )
}
