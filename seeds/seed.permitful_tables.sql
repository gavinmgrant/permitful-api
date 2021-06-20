BEGIN;

TRUNCATE
    permitful_favorites,
    permitful_users
    RESTART IDENTITY CASCADE;

INSERT INTO permitful_users (user_name, password)
VALUES
    ('user', 'password'),
    ('second', 'password');

INSERT INTO permitful_favorites (permit_number, jurisdiction, user_id)
VALUES
    ('202009184442', 'SFO', 1),
    ('202009184449', 'SFO', 1),
    ('202009184452', 'SFO', 2);

COMMIT;