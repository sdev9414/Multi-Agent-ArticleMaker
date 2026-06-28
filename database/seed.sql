-- Seed data for local development.
-- A single default user owns articles created before auth exists (Phase 5+).

INSERT INTO users (id, email, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@newsroom.local', 'Demo User')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Example completed article so History/Viewer have something to show on a fresh DB.
INSERT INTO articles (id, user_id, topic, article_type, audience, status, title, slug, meta_description, final_markdown, seo)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'How solid-state batteries change EV range',
  'Explainer',
  'Developers',
  'completed',
  'Solid-State Batteries and the Future of EV Range',
  'solid-state-batteries-ev-range',
  'How solid-state battery chemistry promises greater range and faster charging for electric vehicles.',
  '# Solid-State Batteries and the Future of EV Range\n\nSolid-state batteries replace the liquid electrolyte with a solid one...\n\n## References\n1. Example Source — https://example.com/solid-state\n',
  JSON_OBJECT('keywords', JSON_ARRAY('solid-state batteries', 'EV range', 'electric vehicles'))
)
ON DUPLICATE KEY UPDATE topic = VALUES(topic);

INSERT INTO evaluations (id, article_id, factuality, citation_quality, readability, completeness, seo_quality, overall_score, issues)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  88, 82, 90, 85, 80, 85,
  JSON_ARRAY('One claim relies on a single source.')
)
ON DUPLICATE KEY UPDATE overall_score = VALUES(overall_score);
