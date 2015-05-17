var express = require('express');
var uuid = require('node-uuid');
var moment = require('moment');
var cryptoHelper = require('../../lib/crypto_helper');
var helper = require('../helper');
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
        res.json({error: 'invalid_grant'});
        return;
      }

      var access_token_payload = JSON.stringify({
        user_id: user.id,
        expiry: moment().add(6, 'hours').toISOString(),
        is_admin: user.is_admin
      });

      cryptoHelper.signAndEncrypt(access_token_payload, function(err, access_token) {
        if (err) {
          res.status(503);
          res.json({error: 'service temporarily unavailable'});
          return;
        }
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


// GET /me
router.get('/me', helper.require_login_json);
router.get('/me', function(req, res, next) {
  req.models.user.find({id: req.user_id}, function(err, results) {
    if (err) {
      res.status(500);
      return next('Error fetching user');
    }
    if (results.length !== 1) {
      res.status(404);
      return res.json({error: 'Not Found'});
    }

    var user = results[0];
    res.json({
      user_id: user.id,
      username: user.username,
      is_admin: user.is_admin
    });
  });
});


// DELETE /revoke_refresh_token
router.delete('/revoke_refresh_token', helper.require_login_json);
router.delete('/revoke_refresh_token', function(req, res, next) {
  var rf_tok = req.body.refresh_token;
  if (!rf_tok) {
    res.status(400);
    return next('Bad Request');
  }
  req.models.refresh_token.find({id: rf_tok, user_id: req.user_id}, function(err, results) {
    if (err) {
      // if they just provided an invalid uuid, just act like 404
      if (err.routine.match(/string_to_uuid/)) {
        results = [];
      }
      else {
        res.status(500);
        return next('Error fetching refresh token');
      }
    }
    if (results.length !== 1) {
      res.status(404);
      return next('Not Found');
    }

    results[0].remove(function(err, _) {
      if (err) {
        res.status(500);
        return next('Error removing refresh token');
      }
      res.json({});
    });

  });
});


module.exports = router;
