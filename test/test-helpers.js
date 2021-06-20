const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
        id: 1,
        user_name: 'test-user-1',
        password: 'password',
    },
    {
        id: 2,
        user_name: 'test-user-2',
        password: 'password',
    },
  ]
};

function makeFavoritesArray(users) {
  return [
    {
        id: 1,
        permit_number: '202000000000',
        jurisdiction: 'SFO',
        user_id: users[0].id,
    },
    {
        id: 2,
        permit_number: '202000000001',
        jurisdiction: 'SFO',
        user_id: users[0].id,
    },
    {
        id: 3,
        permit_number: '202000000002',
        jurisdiction: 'SFO',
        user_id: users[1].id,
    },
  ]
};

function makeExpectedFavorite(users, favorite) {
  const user = users
    .find(user => user.id === favorite.user_id)

  return {
    id: favorite.id,
    permit_number: favorite.permit_number,
    jurisdiction: favorite.jurisdiction,
    user_id: user.id,
  }
};

function makeFavoritesFixtures() {
  const testUsers = makeUsersArray()
  const testFavorites = makeFavoritesArray(testUsers)
  return { testUsers, testFavorites }
};

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        permitful_favorites,
        permitful_users
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE permitful_favorites_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE permitful_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('permitful_favorites_id_seq', 0)`),
        trx.raw(`SELECT setval('permitful_users_id_seq', 0)`),
      ])
    )
  )
};

function seedFavoritesTables(db, users, favorites) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('permitful_favorites').insert(favorites)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('permitful_favorites_id_seq', ?)`,
      [favorites[favorites.length - 1].id],      
    )
  })
};

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('permitful_users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('permitful_users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
};

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
};

module.exports = {
  makeUsersArray,
  makeFavoritesArray,
  makeExpectedFavorite,
  makeFavoritesFixtures,
  cleanTables,
  seedFavoritesTables,
  seedUsers,
  makeAuthHeader,
};