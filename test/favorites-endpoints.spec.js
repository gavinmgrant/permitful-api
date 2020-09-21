const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeFavoritesArray } = require('./favorites.fixtures');
const supertest = require('supertest');

describe('Favorites Endpoints', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
      })
    
    after('disconnect from db', () => db.destroy())
    
    before('clean the favorites table', () => db('permitful_favorites').truncate())

    afterEach('cleanup', () => db('permitful_favorites').truncate())

    describe(`GET /api/favorites`, () => {
        context('Given no favorites', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/favorites')
                    .expect(200, [])
            })
        })

        context('Given there are favorites in the database', () => {
            const testFavorites = makeFavoritesArray();

            beforeEach('insert favorites', () => {
                return db
                    .into('permitful_favorites')
                    .insert(testFavorites)
            })

            it('GET /favorites responds with 200 and all of the favorite permits', () => {
                return supertest(app)
                    .get('/api/favorites')
                    .expect(200, testFavorites)
            })
        })
    })

    describe(`GET /api/favorites/:permit_id`, () => {
        context(`Given no favorites`, () => {
            it(`responds with 404`, () => {
                const permitId = 123456
                return supertest(app)
                    .get(`/api/favorites/${permitId}`)
                    .expect(404, { error: { message: `Favorite permit doesn't exist` } })
            })
        })

        context('Given there are favorites in the database', () => {
            const testFavorites = makeFavoritesArray();

            beforeEach('insert favorites', () => {
                return db
                    .into('permitful_favorites')
                    .insert(testFavorites)
            })

            it('responds with 200 and the specified favorites', () => {
                const permitId = 2;
                const expectedFavorite = testFavorites[permitId - 1];
                return supertest(app)
                    .get(`/api/favorites/${permitId}`)
                    .expect(200, expectedFavorite)
            })
        })
    })
    
});