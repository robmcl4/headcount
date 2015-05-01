'use strict'
var db = require('./db');

exports.up = function(next) {
  db.doQuery('CREATE TABLE access_token (  \
    id      UUID PRIMARY KEY,              \
    user_id INTEGER REFERENCES "user" (id), \
    expiry  TIMESTAMP                      \
    )', function() {
  db.doQuery('CREATE TABLE refresh_token (  \
    id      UUID PRIMARY KEY,               \
    user_id INTEGER REFERENCES "user" (id)   \
    )', next);
  });
};

exports.down = function(next) {
  db.doQuery('DROP TABLE access_token', function() {
    db.doQuery('DROP TABLE refresh_token', next);
  });
};
