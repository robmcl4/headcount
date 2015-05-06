var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var crypto = require('crypto');
var router = express.Router();


var private_key = process.env.PRIVATE_KEY || 'xoCyO5omMAg5BYMrGta3c5aTYs8i6rHSqDr5uoXhl5d9N22j3wuXjI30mCZW';
var hmac_key = crypto.pbkdf2Sync(private_key, 'hmac', 10000, 128, 'sha256').toString('hex');
var encrypt_key = crypto.pbkdf2Sync(private_key, 'encrypt_key', 10000, 24, 'sha256');


// POST /api/users/token
router.post('/token', function(req, res, next) {
  var uname = req.body.username;
  var pass = req.body.password;

  // If no username or password supplied (or grant_type incorrect)
  // then render invalid request
  if (!uname || !pass || req.body.grant_type !== 'password') {
    res.status(400);
    res.json({error: 'invalid_request'});
    return;
  }

  req.models.user.find({username: uname}, 1, function(err, results) {
    if (err || results.length < 1) {
      res.status(400);
      res.json({error: 'invalid_grant'});
      return;
    }
    var user = results[0];
    user.checkPassword(pass, function(isPass) {
      if (!isPass) {
        res.status(400);
        res.json({error: 'invalid_grant'});
        return;
      }

      var access_token_payload = JSON.stringify({
        user_id: user.id,
        expiry: moment().add(6, 'hours').toISOString(),
        is_admin: user.is_admin
      });

      // get random bytes for the IV
      crypto.randomBytes(16, function(err, iv) {
        if (err) {
          res.status(503);
          res.json({error: 'service temporarily unavailable'});
          return;
        }
        // encrypt the payload
        var cypher = crypto.createCipheriv('AES192', encrypt_key, iv);
        var buf = cypher.update(access_token_payload, 'ascii');
        var buf = Buffer.concat([buf, cypher.final()]);
        var encrypted = buf.toString('base64') + '|' + iv.toString('base64');
        var hmac = crypto.createHmac('sha256', hmac_key)
                   .update(encrypted)
                   .digest('base64');
        var access_token = encrypted + '|' + hmac;
        var refresh_token = {
          id: uuid.v4(),
          user_id: user.id
        }
        req.models.refresh_token.create(refresh_token, function(err, results) {
          if (err) {
            res.status(500);
            res.json({error: 'Internal server error'});
            return;
          }
          res.json({
            access_token: access_token,
            token_type: "bearer",
            expires_in: 6*60*60,
            refresh_token: refresh_token.id
          });
        });
      });
    });
  });

});


module.exports = router;
