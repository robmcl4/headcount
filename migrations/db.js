var pg = require('pg');
require('dotenv').load();

var conString = process.env.DATABASE_URL ||
                  ('postgresql://'            +
                  process.env.PSQL_USER + ':' +
                  process.env.PSQL_PASS + '@' +
                  process.env.PSQL_HOST + '/' +
                  process.env.PSQL_DB)        +
                '?pool=true?timezone=UTC';

var testConString = null;
if (process.env.TEST_DATABASE_URL || process.env.PSQL_TEST_USER) {
  testConString = process.env.TEST_DATABASE_URL ||
                  ('postgresql://'            +
                  process.env.PSQL_TEST_USER + ':' +
                  process.env.PSQL_TEST_PASS + '@' +
                  process.env.PSQL_TEST_HOST + '/' +
                  process.env.PSQL_TEST_DB)        +
                '?pool=true&timezone=%2B00';
}


exports.doQuery = function doQuery(str, success, failure) {
  var handler = function(success) {
    return function(err, client, done) {
      if (err) {
        done();
        console.error('ERROR in connection');
        console.error(err);
        if (failure)
          failure(err);
        return;
      }
      client.query(str, function(err, result) {
        done();
        if (err) {
          console.error('ERROR in migration');
          console.error(err);
          if (failure)
            failure(err);
          return;
        }
        success();
      });
    }
  };

  pg.connect(conString,
    handler(function() {
      if (testConString) {
        pg.connect(testConString, handler(success));
      }
      else {
        success();
      }
    })
  );
}
