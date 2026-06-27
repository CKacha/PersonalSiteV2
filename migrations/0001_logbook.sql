CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'text',
  name TEXT NOT NULL,
  message TEXT,
  drawing TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
