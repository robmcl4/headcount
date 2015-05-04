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

// Calculate model hierarchy, where the first in the
// list may be removed first.
// This is done by assuming that if a model has a "hasOne"
// relation then it must be removed before the parent.
// hasOne relations are detected by the "findBy*" method's existence
// in the other object's properties. (ugly, I know)

var capitalizeFirst = function(s) {
  if (s) {
    return s.charAt(0).toUpperCase() + s.substr(1);
  }
  return s;
}

var sorted_models = function() {
  var models_and_keys = [];
  for (prop in db.models) {
    if (!db.models.hasOwnProperty(prop))
      continue;
    models_and_keys.push([prop, db.models[prop]]);
  }

  // remove all non-models (because they set it up as ick)
  return models_and_keys.filter(function(elem) {
    return elem[1].hasOwnProperty("properties");
  })
  // sort by precedence
  .sort(function(a, b) {
    // if a can be found by b, then a should come first
    var aFinder = 'findBy' + capitalizeFirst(a[0]);
    if (b[1].hasOwnProperty(aFinder)) {
      return -1;
    }
    // if b can be found by a, then b should come first
    var bFinder = 'findBy' + capitalizeFirst(b[0]);
    if (a[1].hasOwnProperty(bFinder)) {
      return 1;
    }
    // otherwise it doesn't really matter
    return 0;
  }).map(function(e) {
    return e;
  });
}();

beforeEach('truncate models', function(done) {
  var to_delete = sorted_models.slice();
  if (!to_delete) return;

  function delete_func(err) {
    if (err) throw err;
    if (to_delete.length === 0)
      return done();
    var to_rm = to_delete.pop();
    db.driver.execQuery('TRUNCATE TABLE "' + to_rm[1].table + '" CASCADE', delete_func);
  }
  delete_func();
});
