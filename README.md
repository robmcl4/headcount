# Headcount

[![Build Status](https://travis-ci.org/robmcl4/headcount.svg?branch=master)](https://travis-ci.org/robmcl4/headcount)

A simple tool for keeping a headcount of a room. Also includes graphs
displaying average room occupancy.

## Setup

First make sure you have Node.js, PostgreSQL, and bower.

Follow the following steps:

* `npm install`
* `bower install`
* Copy the `.env.sample` file to `.env`. This file contains environment variable definitions
  which are loaded on startup. NOTE: the environment variable `DATABASE_URL`, if set, superseeds other database configurations (for heroku support).
* Edit the `.env` file to reflect your database connection.

Then, execute `db/schema.sql` to create the schema. I know, this is a bit wonky, migrations will be added
later if needed.

## Running

`npm start` or `node ./bin/www`, either one

## Testing

There are currently no tests... but maybe some coming soon?
