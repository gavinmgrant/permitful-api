require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { CLIENT_ORIGIN } = require('./config');
const favoritesRouter = require('./favorites/favorites-router');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
}))
app.use(helmet());
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.use('/api/favorites', favoritesRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter)

app.get('/api/', (req, res) => {
    res.send('Hello, world!');
    res.json({ok: true});
});

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'Server error. We\'re working on a solution, please come back later.' }}
    } else {
        console.log('error: ', error)
        console.log('next: ', next)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
});

module.exports = app;