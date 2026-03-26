CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(date, time)
);

CREATE INDEX IF NOT EXISTS idx_res_date ON reservations(date);