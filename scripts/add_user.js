var orm = require('orm');
var prompt = require('prompt');
require('dotenv').load();

var models = require('../models');

orm.connect((process.env.DATABASE_URL || ('postgresql://' +
          process.env.PSQL_USER + ':' +
          process.env.PSQL_PASS + '@' +
          process.env.PSQL_HOST + '/' +
          process.env.PSQL_DB)), function(err, db) {
    if (err) {
      console.error('Error in connection');
      console.error(err);
      return;
    }
    models.define(db, db.models);

    var u = new db.models.user();
    var _prompt = [
      {
        name: 'username',
        required: true
      },
      {
        name: 'password',
        required: true,
        hidden: true
      },
      {
        name: 'is_admin',
        type: 'boolean',
        description: 'admin?',
        default: false
      }
    ];
    prompt.get(_prompt, function(err, result) {
      if (err) {
        console.error('Error in reading input');
        console.error(err);
        db.close();
        return;
      }
      u.username = result.username;
      u.is_admin = result.is_admin;
      u.setPassword(result.password, function() {
        u.save(function(err) {
          if (err) {
            console.error('Error in saving user');
            console.error(err);
            db.close();
            return;
          }
          console.log('Created new user with ID ' + u.id);
          u.checkPassword(result.password, function(result) {
            console.log(result);
          })
          db.close();
        });
      });
    });
  }
)
