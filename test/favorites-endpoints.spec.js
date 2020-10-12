const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Favorites Endpoints', function() {
    let db;

    const {
        testUsers,
        testFavorites,
      } = helpers.makeFavoritesFixtures();

    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
      })
    
    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/favorites`, () => {
        
        context('Given no favorites', () => {
            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            )

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/favorites')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })

        context('Given there are favorites in the database', () => {
            beforeEach('insert favorites', () => 
                helpers.seedFavoritesTables(
                    db,
                    testUsers,
                    testFavorites,
                )
            )

            it('GET /favorites responds with 200 and all of the favorite permits', () => {
                const allFavorites = testFavorites.map(favorite =>
                    helpers.makeExpectedFavorite(
                        testUsers,
                        favorite,
                    )
                )

                const expectedFavorites = allFavorites.filter(favorite => {
                    return favorite.user_id == 1
                }) 

                return supertest(app)
                    .get('/api/favorites')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedFavorites)
            })
        })
    })

    describe(`GET /api/favorites/:permit_id`, () => {
        context(`Given no favorites`, () => {
            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            )

            it(`responds with 404`, () => {
                const permitId = 123456
                return supertest(app)
                    .get(`/api/favorites/${permitId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Favorite permit doesn't exist` } })
            })
        })

        context('Given there are favorites in the database', () => {
            beforeEach('insert favorites', () => 
                helpers.seedFavoritesTables(
                    db,
                    testUsers,
                    testFavorites,
                )
            )

            it('responds with 200 and the specified favorites', () => {
                const permitNumber = 202000000000;
                const expectedFavorite = helpers.makeExpectedFavorite(
                    testUsers,
                    testFavorites[0],
                  )
                return supertest(app)
                    .get(`/api/favorites/${permitNumber}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedFavorite)
            })
        })
    })

    describe(`POST /api/favorites`, () => {
        beforeEach('insert favorites', () => 
                helpers.seedFavoritesTables(
                    db,
                    testUsers,
                    testFavorites,
                )
            )

        it(`creates a favorite permit, responding with 201 and the new favorite`, function() {
            const testUser = testUsers[0]
            const newFavorite = {
                permit_number: '202009184479',
                user_id: testUser.id
            }
            return supertest(app)
                .post('/api/favorites')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newFavorite)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.permit_number).to.eq(newFavorite.permit_number)
                    expect(res.headers.location).to.eq(`/favorites/${res.body.permit_number}`)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/favorites/${postRes.body.permit_number}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(postRes.body)
                )
        })

        it(`responds with 400 and an error message when the permit_number field is missing`, () => {
            const newFavorite = {
                permit_number: null
            }

            return supertest(app)
                .post('/api/favorites')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newFavorite)
                .expect(400, {
                    error: { message : `Missing 'permit_number' in request body`}
                })
        })
    })

    describe(`DELETE /api/favorites/:permit_id`, () => {
        context(`Given no favorites`, () => {
            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            )
            
            it(`responds with 404`, () => {
                const permitId = 123456
                return supertest(app)
                    .delete(`/api/favorites/${permitId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { 
                        error: { message: `Favorite permit doesn't exist` }
                    })
            })
        })

        context('Given there are favorites in the database', () => {
            beforeEach('insert favorites', () => 
                helpers.seedFavoritesTables(
                    db,
                    testUsers,
                    testFavorites,
                )
            )

            it('responds with 204 and removes the favorite', () => {
                const permitToRemove = 202000000002;
                const idToRemove = 3;
                const expectedFavorites = testFavorites.filter(favorite => favorite.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/favorites/${permitToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/favorites`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedFavorites)    
                    )
            })
        })
    })
    
});