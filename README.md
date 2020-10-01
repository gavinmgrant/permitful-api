# Permitful API

This is a project using a PostgreSQL database and Express server for the Permitful building permit search app.

Permitful provides an interactive map that allows users to visualize where all of the most recently updated building permits in a specific jurisdiction are located. **The City and County of San Francisco** is the first supported jurisdiction.

## Permitful Client

View the client side code in this [GitHub repo](https://github.com/gavinmgrant/permitful-client).

## Technology

* [Node.js](https://nodejs.org/en/) - JavaScript runtime environment
* [Express](https://expressjs.com/) - Node.js framework
* [RESTful APIs](https://restfulapi.net/) - Architectural style for an API
* [PostgreSQL](https://www.postgresql.org/) - Relational Database 
* [Knex.js](http://knexjs.org/) - SQL query builder
* [JWT](https://jwt.io/) - Authentication 
* [Supertest](https://www.npmjs.com/package/supertest) - Integration testing 
* [Mocha](https://mochajs.org/) - Unit testing
* [Chai](https://www.chaijs.com/) - Unit testing 
* [Heroku](https://heroku.com) - Cloud platform for deployment

## Setup

* Clone this repository to your local computer.
* Install the dependencies for the project. `npm install`
* Confirm your PostgreSQL server is running.
* If you want to seed your database, you can use this seed script: 

```
psql -U YOUR_USERNAME -d permitful -f ./seeds/seed.permitful_favorites.sql
```

* Copy the `example.env` file as `.env` and update `.env` with the following fields with your database credentials:

```
DATABASE_URL="postgresql://YOUR_USERNAME@localhost/YOUR_DATABASE_NAME"
TEST_DATABASE_URL="postgresql://YOUR_USERNAME@localhost/YOUR_TEST_DATABASE_NAME"
```

* You can now run the server locally with `npm start`.

## Schema

### Favorites Table `permitful_favorites`
```
{
    id: Integer (primary key),
    permit_number: String,
    user_id: Integer (foreign key)
}
```

### Users Table `permitful_users`
```
{
    id: Integer (primary key),
    user_name: String,
    password: String
}
```

## API Overview
```
/api
├── /auth
│   └── POST
│       ├── /login
│       ├── /refresh
├── /users
│   └── POST
│       └── / 
└── /favorites
    ├── GET
    │   ├── /
    │   └── /favorites/:permit_id
    ├── POST 
    │   └── /
    └── DELETE 
        └── /favorites/:permit_id     
```

### POST `/api/auth/login`
```
// req.body
{
    user_name: String,
    password: String
}

// res.body
{
    authToken: String,
    user_id: Integer,
    user_name: String
}
```

### POST `/api/auth/refresh`
```
// req.header
authorization: bearer ${token}

// res.body
{
    authToken: ${token}
}
```

### POST `/api/users`
```
// req.body
{
    user_name: String,
    password: String
}

// res.body
{
    id: Integer,
    user_name: String
}
```

### GET `/api/favorites`
```
// req.header
authorization: bearer ${token}

//res.body
{
    id: Integer
    permit_number: String,
    user_id: Integrer
}
```

### GET `/api/favorites/:permit_id`
```
// req.header
authorization: bearer ${token}

// req.params
{
    permit_id: String
}

//res.body
{
    id: Integer
    permit_number: String,
    user_id: Integrer
}
```

### POST `/api/favorites`
```
// req.header
authorization: bearer ${token}

//req.body
{
    permit_number: String, 
    user_id: Integer
}

//res.body
{
    id: Integer
    permit_number: String,
    user_id: Integrer
}
```

### DELETE `/api/favorites/:permit_id`
```
// req.header
authorization: bearer ${token}

// req.params
{
    permit_id: String
}
```