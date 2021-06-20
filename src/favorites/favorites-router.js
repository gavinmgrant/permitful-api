const express = require('express');
const FavoritesService = require('./favorites-service');
const { requireAuth } = require('../middleware/jwt-auth')

const favoritesRouter = express.Router();
const jsonParser = express.json();

favoritesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FavoritesService.getAllFavorites(knexInstance, req.user.id)
            .then(favorites => {
                res.json(favorites)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { permit_number, jurisdiction, user_id } = req.body;
        const newFavorite = { permit_number, jurisdiction, user_id };

        for(const [key, value] of Object.entries(newFavorite)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        newFavorite.user_id = req.user.id;

        FavoritesService.insertFavorite(
            req.app.get('db'),
            newFavorite
        )
            .then(favorite => {
                res 
                    .status(201)
                    .location(`/favorites/${favorite.permit_number}`)
                    .json(favorite)
            })
            .catch(next)
    })

favoritesRouter
    .route('/:permit_id')
    .all(requireAuth)
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        FavoritesService.getById(knexInstance, req.params.permit_id)
            .then(favorite => {
                if (!favorite) {
                    return res.status(404).json({
                        error: { message: `Favorite permit doesn't exist` }
                    })
                }
                res.favorite = favorite
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FavoritesService.getById(knexInstance, req.params.permit_id)
            .then(favorite => {
                res.json(favorite)
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        FavoritesService.deleteFavorite(knexInstance, req.params.permit_id, req.user.id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = favoritesRouter;