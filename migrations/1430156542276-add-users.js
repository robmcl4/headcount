'use strict'
var db = require('./db');

exports.up = function(next) {
  db.doQuery('CREATE TABLE users (   \
      id       SERIAL PRIMARY KEY,   \
      username VARCHAR(20) UNIQUE,   \
      salt     CHAR(12),             \
      hash     CHAR(32),             \
      is_admin BOOLEAN DEFAULT FALSE \
    )', next);
};

exports.down = function(next) {
  db.doQuery('DROP TABLE users', next);
};
