var pg = require('pg');
require('dotenv').load();

var conString = process.env.DATABASE_URL ||
                  ('postgresql://'            +
                  process.env.PSQL_USER + ':' +
                  process.env.PSQL_PASS + '@' +
                  process.env.PSQL_HOST + '/' +
                  process.env.PSQL_DB)        +
                '?pool=true?timezone=UTC';

var client = new pg.Client(conString);

exports.doQuery = function doQuery(str, success, failure) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
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
  });
}
