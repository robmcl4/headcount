var db = require('./db');
var proxyquire = require('proxyquire');
module.exports.db = db;
var assert = require('assert');

// Get the Express app with db stubbed
proxyquire = proxyquire.noCallThru();
module.exports.app = proxyquire('../app', {
  orm: {
    express: db.express
  },
  morgan: function() {
    return function(req, res, next) {
      next();
    }
  }
});
proxyquire.callThru();

module.exports.clearModel = function(model, cb) {
  db.driver.execQuery('TRUNCATE TABLE "' + model.table + '" CASCADE', cb);
}
