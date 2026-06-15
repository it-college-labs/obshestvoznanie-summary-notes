CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    week TEXT NOT NULL,
    title TEXT NOT NULL,
    annotation TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    accent TEXT[] NOT NULL,
    folder_preview_images TEXT[] NOT NULL,
    bot_thinking_image TEXT NOT NULL,
    reading_time TEXT NOT NULL,
    content JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_updated_at ON articles(updated_at DESC);
