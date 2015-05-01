'use strict'
var db = require('./db');

exports.up = function(next) {
  db.doQuery('CREATE TABLE "user" (   \
      id       SERIAL PRIMARY KEY,   \
      username VARCHAR(20) UNIQUE,   \
      salt     CHAR(16),             \
      hash     CHAR(128),            \
      is_admin BOOLEAN DEFAULT FALSE \
    )', next);
};

exports.down = function(next) {
  db.doQuery('DROP TABLE "user"', next);
};
