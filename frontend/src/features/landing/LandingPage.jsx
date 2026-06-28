import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusChip from '../../components/ui/StatusChip'
import { AGENTS } from './agents'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <LandingNav />
      <main>
        <Hero />
        <PipelineStrip />
        <CtaBand />
      </main>
      <LandingFooter />
    </div>
  )
}

function LandingNav() {
  return (
    <header className="border-b border-hairline">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-body font-medium tracking-tight">
          <span className="size-2.5 rounded-full bg-deep-green" aria-hidden="true" />
          Multi-Agent Newsroom
        </Link>
        <nav className="flex items-center gap-6" aria-label="Primary">
          <Link to="/dashboard" className="text-body text-body-muted hover:text-ink max-sm:hidden">
            Dashboard
          </Link>
          <Button as={Link} to="/create" size="sm">
            Create article
          </Button>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="container-page grid items-center gap-12 py-section lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="mono-label text-deep-green">AI workflow engine</p>
        <h1 className="mt-6 font-display text-hero-display text-ink">
          Six agents. One fact-checked article.
        </h1>
        <p className="mt-6 max-w-prose text-body-large text-body-muted">
          Give it a topic. Watch a pipeline of specialized agents research, verify, edit, optimize,
          and publish — every claim backed by a citation, every run scored. Not a chatbot. A
          newsroom that shows its work.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Button as={Link} to="/create">Create an article</Button>
          <Button as={Link} to="/dashboard" variant="secondary">
            See the pipeline live
          </Button>
        </div>
      </div>
      <AgentConsoleCard />
    </section>
  )
}

// Dark product mockup — DESIGN.md agent-console-card. Carries the page's color energy.
function AgentConsoleCard() {
  const states = ['done', 'done', 'running', 'idle', 'idle', 'idle']
  return (
    <div className="rounded-lg bg-primary p-6 text-white shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="font-mono text-micro uppercase tracking-[0.28px] text-white/60">
          run · the future of fusion energy
        </p>
        <span className="font-mono text-micro text-white/40">02:14</span>
      </div>
      <ul className="mt-4 space-y-1">
        {AGENTS.map((agent, i) => (
          <li
            key={agent.key}
            className="flex items-center justify-between rounded-sm px-3 py-2.5 odd:bg-white/[0.03]"
          >
            <span className="flex items-center gap-3">
              <span className="font-mono text-micro text-white/40">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-body text-white/90">{agent.name}</span>
            </span>
            <StatusChip tone={states[i]}>{states[i]}</StatusChip>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-micro text-white/50">
        <span>12 sources</span>
        <span>8.4k tokens</span>
        <span className="text-pale-green">score 91</span>
      </div>
    </div>
  )
}

function PipelineStrip() {
  return (
    <section className="border-y border-hairline bg-soft-stone/40">
      <div className="container-page py-section">
        <h2 className="max-w-prose font-display text-section-heading text-ink">
          Each agent does one thing, and does it in the open.
        </h2>
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent, i) => (
            <article key={agent.key} className="border-t border-hairline pt-5">
              <p className="font-mono text-micro text-muted">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 font-display text-feature-heading text-ink">{agent.name}</h3>
              <p className="mt-2 text-body text-body-muted">{agent.does}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// Deep-green full-width band — DESIGN.md dark-feature-band / CTA.
function CtaBand() {
  return (
    <section className="container-page py-section">
      <div className="rounded-lg bg-deep-green px-8 py-16 text-white md:px-16 md:py-20">
        <h2 className="max-w-prose font-display text-section-heading">
          Turn a topic into a citation-backed article.
        </h2>
        <p className="mt-4 max-w-prose text-body-large text-white/70">
          Start a run and watch every agent report in.
        </p>
        <div className="mt-8">
          <Button as={Link} to="/create" variant="inverse">
            Create your first article
          </Button>
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-page flex flex-col gap-2 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="mono-label">Multi-Agent Newsroom</p>
        <p className="text-micro text-muted">An AI engineering demonstration · {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
