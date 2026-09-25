CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL DEFAULT ''
);

-- F2 Mina drinkar: en rad per egen drink. drink_json NULL = raderad (spärrar att en annan enhet laddar upp den igen).
CREATE TABLE IF NOT EXISTS user_drinks (
  id TEXT NOT NULL,
  firebase_uid TEXT NOT NULL,
  drink_json TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (firebase_uid, id)
);

-- F3 förslag till katalogen. firebase_uid töms ('') för accepted/published när kontot raderas.
CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new | accepted | published | declined
  drink_id TEXT, note TEXT,
  created_at INTEGER NOT NULL, reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS suggestions_uid ON suggestions(firebase_uid);
