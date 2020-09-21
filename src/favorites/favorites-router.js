const path = require('path');
const express = require('express');
const FavoritesService = require('./favorites-service');

const favoritesRouter = express.Router();
const jsonParser = express.json();

favoritesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FavoritesService.getAllFavorites(knexInstance)
            .then(favorites => {
                res.json(favorites)
            })
            .catch(next)
    })

module.exports = favoritesRouter;