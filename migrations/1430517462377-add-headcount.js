'use strict'
var db = require('./db');

exports.up = function(next) {
  db.doQuery('CREATE TABLE headcount (     \
  id       SERIAL PRIMARY KEY,             \
  how_many SMALLINT CHECK (how_many >= 0), \
  initials VARCHAR(10) NOT NULL,           \
  ts       TIMESTAMP                       \
 )', next);
};

exports.down = function(next) {
  db.doQuery('DROP TABLE headcount', next);
};
