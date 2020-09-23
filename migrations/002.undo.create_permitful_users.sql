ALTER TABLE permitful_favorites
  DROP COLUMN IF EXISTS user_id;

DROP TABLE IF EXISTS permitful_users;