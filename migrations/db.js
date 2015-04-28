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
  client.connect(function(err) {
    if (err) {
      console.error('ERROR in connection');
      console.error(err);
      if (failure)
        failure(err);
    } else {
      client.query(str, function(err, result) {
        if (err) {
          console.error('ERROR in migration');
          console.error(err);
          if (failure)
            failure(err);
        } else {
          client.end();
          success();
        }
      });
    }
  });
}
