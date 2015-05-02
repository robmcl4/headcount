var orm = require('orm');
require('dotenv').load();

var models = require('../models');

var connStr = process.env.TEST_DATABASE_URL ||
              ('postgresql://'            +
              process.env.PSQL_TEST_USER + ':' +
              process.env.PSQL_TEST_PASS + '@' +
              process.env.PSQL_TEST_HOST + '/' +
              process.env.PSQL_TEST_DB)        +
            '?pool=true?timezone=UTC';

console.log(connStr);

module.exports = orm.connect(connStr, function(err, db) {
  if (err) throw err;
});
models.define(module.exports, module.exports.models);
