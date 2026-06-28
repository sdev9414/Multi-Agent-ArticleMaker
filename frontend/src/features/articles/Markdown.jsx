import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Markdown → on-brand elements (no Tailwind typography plugin; map components directly
// to DESIGN.md tokens for editorial, readable output).
const components = {
  h1: (props) => <h1 className="mt-8 font-display text-section-heading text-ink first:mt-0" {...props} />,
  h2: (props) => <h2 className="mt-8 font-display text-feature-heading text-ink" {...props} />,
  h3: (props) => <h3 className="mt-6 font-display text-body-large font-medium text-ink" {...props} />,
  p: (props) => <p className="mt-4 text-body leading-relaxed text-ink" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-1.5 pl-6 text-body text-ink" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-body text-ink" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    <a className="text-action-blue underline underline-offset-2 hover:text-focus-blue" target="_blank" rel="noreferrer noopener" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="mt-4 border-l-2 border-deep-green pl-4 text-body text-body-muted" {...props} />
  ),
  code: (props) => <code className="rounded-xs bg-soft-stone px-1.5 py-0.5 font-mono text-caption text-ink" {...props} />,
  hr: () => <hr className="my-8 border-hairline" />,
  table: (props) => <table className="mt-4 w-full border-collapse text-body" {...props} />,
  th: (props) => <th className="border-b border-hairline px-3 py-2 text-left font-medium text-ink" {...props} />,
  td: (props) => <td className="border-b border-hairline px-3 py-2 text-body-muted" {...props} />,
}

export default function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children || ''}
    </ReactMarkdown>
  )
}
