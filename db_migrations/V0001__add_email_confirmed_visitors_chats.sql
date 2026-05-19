ALTER TABLE t_p65094263_small_producers_cata.users
  ADD COLUMN IF NOT EXISTS email_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verification_token text,
  ADD COLUMN IF NOT EXISTS email_verification_expires timestamp with time zone;

CREATE TABLE IF NOT EXISTS t_p65094263_small_producers_cata.visitor_favorites (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES t_p65094263_small_producers_cata.users(id),
  type text NOT NULL CHECK (type IN ('manufacturer', 'product')),
  ref_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, type, ref_id)
);

CREATE TABLE IF NOT EXISTS t_p65094263_small_producers_cata.chats (
  id serial PRIMARY KEY,
  visitor_id integer NOT NULL REFERENCES t_p65094263_small_producers_cata.users(id),
  manufacturer_user_id integer NOT NULL REFERENCES t_p65094263_small_producers_cata.users(id),
  manufacturer_id integer NOT NULL REFERENCES t_p65094263_small_producers_cata.manufacturers(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(visitor_id, manufacturer_id)
);

CREATE TABLE IF NOT EXISTS t_p65094263_small_producers_cata.chat_messages (
  id serial PRIMARY KEY,
  chat_id integer NOT NULL REFERENCES t_p65094263_small_producers_cata.chats(id),
  sender_id integer NOT NULL REFERENCES t_p65094263_small_producers_cata.users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);