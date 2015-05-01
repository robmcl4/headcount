var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var router = express.Router();

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
        console.log('invalid password');
        res.json({error: 'invalid_grant'});
        return;
      }

      var access_token = {
        id: uuid.v4(),
        user_id: user.id,
        expiry: moment().add(6, 'hours').toISOString()
      }
      var refresh_token = {
        id: uuid.v4(),
        user_id: user.id
      }
      req.models.access_token.create(access_token, function(err, results) {
        if (err) {
          res.status(500);
          res.json({error: 'Internal server error'});
          return;
        }
        req.models.refresh_token.create(refresh_token, function(err, results) {
          if (err) {
            res.status(500);
            res.json({error: 'Internal server error'});
            return;
          }
          res.json({
            access_token: access_token.id,
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
