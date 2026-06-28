// The six pipeline agents, in execution order. Shared across landing, dashboard,
// and viewer so the pipeline is described in exactly one place.
export const AGENTS = [
  { key: 'research', name: 'Research', does: 'Searches, collects sources, removes duplicates, summarizes findings.' },
  { key: 'fact-checker', name: 'Fact Checker', does: 'Verifies every claim, attaches citations, flags weak evidence.' },
  { key: 'editor', name: 'Editor', does: 'Builds the outline, structures sections, improves readability.' },
  { key: 'seo', name: 'SEO', does: 'Generates title, meta description, slug, keywords, headings.' },
  { key: 'publisher', name: 'Publisher', does: 'Produces final markdown, references, and formatting.' },
  { key: 'evaluator', name: 'Evaluator', does: 'Scores factuality, citations, readability, completeness, SEO.' },
]
