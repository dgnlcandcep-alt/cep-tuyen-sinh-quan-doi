CREATE TABLE IF NOT EXISTS qa_users (
  id BIGSERIAL PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 40),
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qa_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES qa_users(id) ON DELETE CASCADE,
  reply_to BIGINT REFERENCES qa_messages(id) ON DELETE SET NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','hidden','deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_messages_created_at ON qa_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_messages_user_id ON qa_messages(user_id);
