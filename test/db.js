var orm = require('orm');
var crypto = require('crypto');
var proxyquire = require('proxyquire');
require('dotenv').load();

// stub crypto so that it has faster password hashing
var oldPbkdf2 = crypto.pbkdf2;
crypto.pbkdf2 = function() {
  arguments[2] = 1; // set iterations to 1
  return oldPbkdf2.apply(crypto, arguments);
}
var models = proxyquire('../models', {
  crypto: crypto
});

proxyquire.callThru();

var connStr = process.env.TEST_DATABASE_URL ||
              ('postgresql://'            +
              process.env.PSQL_TEST_USER + ':' +
              process.env.PSQL_TEST_PASS + '@' +
              process.env.PSQL_TEST_HOST + '/' +
              process.env.PSQL_TEST_DB)        +
            '?pool=true&timezone=%2B00';

module.exports = orm.connect(connStr, function(err, db) {
  if (err) throw err;
});
models.define(module.exports, module.exports.models);
