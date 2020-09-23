BEGIN;

TRUNCATE
    permitful_favorites,
    permitful_users
    RESTART IDENTITY CASCADE;

INSERT INTO permitful_users (user_name, password)
VALUES
    ('user', 'password');

INSERT INTO permitful_favorites (permit_number, user_id)
VALUES
    ('202009184442', 1),
    ('202009184449', 1),
    ('202009184452', 1);

COMMIT;