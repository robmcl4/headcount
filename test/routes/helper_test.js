var helper = require('../../routes/helper');
var cryptoHelper = require('../../lib/crypto_helper');
var expect = require('expect');
var moment = require('moment');

describe('route helper', function() {
  describe('require_login_json', function() {

    function stubbed_response_401() {
      this.status = function(stat) {
        if (stat)
          this._status = stat;
        else
          return this._status;
      }
      this.json = function(obj) {
        expect(obj).toEqual({error: 'Unauthorized'});
        expect(this._status).toEqual(401);
      }
    }

    function stubbed_response_400() {
      this.status = function(stat) {
        if (stat)
          this._status = stat;
        else
          return this._status;
      }
      this.json = function(obj) {
        expect(obj).toEqual({error: 'Bad Request'});
        expect(this._status).toEqual(400);
      }
    }

    it('should 401 unauthorized when no Authorization header supplied', function() {
      var res = new stubbed_response_401();
      helper.require_login_json(
        {headers: {}},
        res,
        function() {throw 'This should not happen'}
      )
    });

    it('should 400 bad request when the authorization string doesnt have 1 space', function() {
      var res = new stubbed_response_400();
      helper.require_login_json(
        {headers: {authorization: 'foobar'}},
        res,
        function() {throw 'This should not happen'});
      helper.require_login_json(
        {headers: {authorization: 'foo bar baz'}},
        res,
        function() {throw 'This should not happen'});
    });

    it('should 400 bad request when the authorization string doesn\'t start with Bearer', function() {
      var res = new stubbed_response_400();
      helper.require_login_json(
        {headers: {authorization: 'Foo barbaz'}},
        res,
        function() {throw 'This should not happen'});
    });

    it('should 401 unauthorized when it cannot decrypt the string', function() {
      var res = new stubbed_response_401();
      helper.require_login_json(
        {headers: {authorization: 'Bearer foobarbaz'}},
        res,
        function() {throw 'This should not happen'});
    });

    it('should 401 unauthorized when the mac doesnt match', function() {
      var res = new stubbed_response_401();
      var date = moment().add(5, 'hours').toISOString();
      cryptoHelper.signAndEncrypt({user_id: 1, expiry: date, is_admin: false},
        function(err, s) {
          if (err) throw err;
          // modify 1 character in 's'
          var toSwap = 'a';
          if (s.charAt(7) === 'a')
            toSwap = 'b';
          s = s.substring(0, 7) + toSwap + s.substring(8);
          helper.require_login_json(
            {headers: {authorization: 'Bearer ' + s}},
            res,
            function() {throw 'This should not happen'});
        });
    });

    it('should 401 when it has already expired', function(done) {
      var res = new stubbed_response_401();
      var old_json = res.json;
      res.json = function(obj) {
        old_json.call(res, obj);
        done();
      }

      var date = moment().add(-1, 'hours').toISOString();
      cryptoHelper.signAndEncrypt({user_id: 1, expiry: date, is_admin: false}, 
        function(err, s) {
          if (err) throw err;

          helper.require_login_json(
            {headers: {authorization: 'Bearer ' + s}},
            res,
            function() {throw 'This should not happen'});
        });
    });

    it('should set user_id, is_admin and expiry when everything is correct', function(done) {
      var date = moment().add(6, 'hours').toISOString();
      cryptoHelper.signAndEncrypt({user_id: 102, expiry: date, is_admin: false},
        function(err, s) {
          if (err) throw err;
          var req = {
            headers: {authorization: 'Bearer ' + s}
          };

          helper.require_login_json(req, {}, function(err) {
            if (err) throw err;
            expect(req.user_id).toEqual(102);
            expect(req.expiry).toEqual(new Date(date));
            expect(req.is_admin).toEqual(false);
            done();
          });
        });
    });

  });
});
