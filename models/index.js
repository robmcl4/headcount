var crypto = require('crypto');

function define(db, models) {
  models.headcount = db.define('headcount', {
    id       : {type: 'serial', key: true},
    how_many : {type: 'integer', size:4},
    initials : {type: 'text', size: 10},
    ts       : {type: 'date', time: true}
  });


  models.user = db.define('user', {
    id       : {type: 'serial', key: true},
    username : {type: 'text', size: 20},
    salt     : {type: 'text', size: 16},
    hash     : {type: 'text', size: 128},
    is_admin : {type: 'boolean'}
  }, {
    methods: {

      _generateSalt: function genSalt(callback) {
        var _this = this;
        if (_this.salt) {
          if (callback)
            callback();
          return;
        }
        crypto.randomBytes(8, function(ex, buf) {
          if (ex) throw ex;
          _this.salt = buf.toString('hex');
          if (callback)
            callback();
        });
      },

      setPassword: function setPassword(newPass, callback) {
        var _this = this;
        this._generateSalt(function() {
          crypto.pbkdf2(newPass, _this.salt, 64000, 64, 'sha256', function(err, key) {
            if (err) throw err;
            _this.hash = key.toString('hex');
            if (callback)
              callback();
          });
        });
      },

      checkPassword: function checkPassword(pass, callback) {
        var _this = this;
        crypto.pbkdf2(pass, _this.salt, 64000, 64, 'sha256', function(err, key) {
          if (err) throw err;
          if (callback)
            callback(key.toString('hex') === _this.hash);
        })
      }
    }
  });

  models.refresh_token = db.define('refresh_token', {
    id      : {type: 'text'},
    user_id : {type: 'integer'}
  })
  .hasOne('user', models.user, { reverse: 'refresh_tokens' });


  models.db = db;
}

module.exports.define = define;
