# Permitful API

This is a project using a PostgreSQL database and Express server for the Permitful building permit search app.

## Setup

* Clone this repository to your local computer.
* Install the dependencies for the project.
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