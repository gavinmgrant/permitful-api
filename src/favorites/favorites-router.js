const path = require('path');
const express = require('express');
const FavoritesService = require('./favorites-service');

const favoritesRouter = express.Router();
const jsonParser = express.json();

favoritesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FavoritesService.getAllFavorites(knexInstance)
            .then(favorites => {
                res.json(favorites)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { permit_number } = req.body;
        const newFavorite = { permit_number }

        for(const [key, value] of Object.entries(newFavorite)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }
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
module.exports = favoritesRouter;