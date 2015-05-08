var cryptoHelper = require('../lib/crypto_helper.js');
var moment = require('moment');

module.exports.require_login_json = function(req, res, next) {
  function unauthorized() {
    res.status(401);
    res.json({error: 'Unauthorized'});
  }

  function bad_request() {
    res.status(400);
    res.json({error: 'Bad Request'});
  }

  if (req.headers['authorization'] === undefined ||
      req.headers['authorization'] === null) {
    return unauthorized();
  }

  var x = req.headers['authorization'];
  var split = x.split(' ');

  if (split.length !== 2) {
    return bad_request();
  }

  if (split[0] !== 'Bearer') {
    return bad_request();
  }

  cryptoHelper.decryptAndCheckSig(split[1], function(err, payload) {
    if (err) {
      return unauthorized();
    }

    var expires = moment(payload.expiry);
    // if it has expired the request is unauthorized
    if (expires - moment() < 0) {
      return unauthorized();
    }

    req.user_id = payload.user_id;
    req.is_admin = payload.is_admin;
    req.expiry = expires.toDate();
    next();
  });
}