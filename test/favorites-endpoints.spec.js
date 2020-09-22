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
                const permitNumber = 202011111111;
                const expectedFavorite = testFavorites[0];
                return supertest(app)
                    .get(`/api/favorites/${permitNumber}`)
                    .expect(200, expectedFavorite)
            })
        })
    })

    describe(`POST /api/favorites`, () => {
        const testFavorites = makeFavoritesArray()

        it(`creates a favorite permit, responding with 201 and the new favorite`, function() {
            const newFavorite = {
                permit_number: '202009184479'
            }
            return supertest(app)
                .post('/api/favorites')
                .send(newFavorite)
                .expect(201)
                .expect(res => {
                    expect(res.body.permit_number).to.eq(newFavorite.permit_number)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eq(`/favorites/${res.body.permit_number}`)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/favorites/${postRes.body.permit_number}`)
                        .expect(postRes.body)
                )
        })

        it(`responds with 400 and an error message when the permit_number field is missing`, () => {
            const newFavorite = {
                permit_number: null
            }

            return supertest(app)
                .post('/api/favorites')
                .send(newFavorite)
                .expect(400, {
                    error: { message : `Missing 'permit_number' in request body`}
                })
        })
    })

    describe(`DELETE /api/favorites/:permit_id`, () => {
        context(`Given no favorites`, () => {
            it(`responds with 404`, () => {
                const permitId = 123456
                return supertest(app)
                    .delete(`/api/favorites/${permitId}`)
                    .expect(404, { error: { message: `Favorite permit doesn't exist` } })
            })
        })

        context('Given there are favorites in the database', () => {
            const testFavorites = makeFavoritesArray()

            beforeEach('insert favorites', () => {
                return db
                    .into('permitful_favorites')
                    .insert(testFavorites)
                })

            it('responds with 204 and removes the favorite', () => {
                const permitNumberToRemove = 202033333333;
                const idToRemove = 3;
                const expectedFavorites = testFavorites.filter(favorite => favorite.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/favorites/${permitNumberToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/favorites`)
                            .expect(expectedFavorites)    
                    )
            })
        })
    })
    
});