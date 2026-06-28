-- Multi-Agent Newsroom — MySQL schema
-- Engine: InnoDB (FK support). Charset: utf8mb4 (full Unicode incl. emoji).
-- Run order matters: tables reference earlier ones via FKs.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- users — accounts. Auth is a future feature; a default user owns Phase-5 rows.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  email       VARCHAR(255)  NOT NULL,
  name        VARCHAR(120)  NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- articles — one row per generation run / produced article.
-- status tracks the workflow lifecycle.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles (
  id              CHAR(36)      NOT NULL PRIMARY KEY,
  user_id         CHAR(36)      NULL,
  topic           VARCHAR(255)  NOT NULL,
  article_type    VARCHAR(60)   NOT NULL DEFAULT 'Explainer',
  audience        VARCHAR(60)   NOT NULL DEFAULT 'General public',
  status          ENUM('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
  -- Final outputs (populated by Publisher / SEO agents).
  title           VARCHAR(255)  NULL,
  slug            VARCHAR(255)  NULL,
  meta_description VARCHAR(320) NULL,
  final_markdown  LONGTEXT      NULL,
  -- SEO keywords + outline kept as JSON for flexibility.
  seo             JSON          NULL,
  error           TEXT          NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_articles_status (status),
  KEY idx_articles_created (created_at),
  KEY idx_articles_user (user_id),
  KEY idx_articles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- sources — research sources collected per article (Research agent output).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sources (
  id                CHAR(36)      NOT NULL PRIMARY KEY,
  article_id        CHAR(36)      NOT NULL,
  title             VARCHAR(512)  NULL,
  url               VARCHAR(2048) NOT NULL,
  snippet           TEXT          NULL,
  publisher         VARCHAR(255)  NULL,
  published_date    VARCHAR(60)   NULL,
  credibility_notes TEXT          NULL,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sources_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  KEY idx_sources_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- agent_runs — per-agent execution record for observability (timing, tokens, cost).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_runs (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  article_id    CHAR(36)     NOT NULL,
  agent         VARCHAR(40)  NOT NULL,   -- research | fact-checker | editor | seo | publisher | evaluator
  status        ENUM('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
  latency_ms    INT          NULL,
  tokens_input  INT          NOT NULL DEFAULT 0,
  tokens_output INT          NOT NULL DEFAULT 0,
  cost_usd      DECIMAL(10,5) NOT NULL DEFAULT 0,
  retries       INT          NOT NULL DEFAULT 0,
  error         TEXT         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_agentruns_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  KEY idx_agentruns_article (article_id),
  KEY idx_agentruns_agent (agent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- evaluations — Evaluator agent scores (one row per article; latest wins).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
  id              CHAR(36)     NOT NULL PRIMARY KEY,
  article_id      CHAR(36)     NOT NULL,
  factuality      TINYINT      NOT NULL DEFAULT 0,
  citation_quality TINYINT     NOT NULL DEFAULT 0,
  readability     TINYINT      NOT NULL DEFAULT 0,
  completeness    TINYINT      NOT NULL DEFAULT 0,
  seo_quality     TINYINT      NOT NULL DEFAULT 0,
  overall_score   TINYINT      NOT NULL DEFAULT 0,
  issues          JSON         NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evaluations_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  KEY idx_evaluations_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- article_versions — snapshot history for version comparison (future feature).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_versions (
  id             CHAR(36)   NOT NULL PRIMARY KEY,
  article_id     CHAR(36)   NOT NULL,
  version_number INT        NOT NULL DEFAULT 1,
  markdown       LONGTEXT    NULL,
  created_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_versions_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  UNIQUE KEY uq_version (article_id, version_number),
  KEY idx_versions_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
