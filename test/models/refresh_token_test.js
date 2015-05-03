var h = require('../helper');
var db = h.db;
var expect = require('expect');
var uuid = require('node-uuid');

describe('refresh_token', function() {
  var model = db.models.refresh_token;

  describe('properties', function() {
    var properties = model.properties;

    it('has an id', function() {
      expect(properties.id).toExist();
      expect(properties.id.type).toEqual('serial');
    });

    it('has a user_id', function() {
      expect(properties.user_id).toExist();
      expect(properties.user_id.type).toEqual('integer');
    });

  });

  describe('persistance', function() {

    var user = null;

    beforeEach('load a user', function(done) {
      user = new db.models.user({
        username: 'foobar',
        is_admin: false
      });
      db.models.user.create(user, function(err, result) {
        if (err) throw err;
        done();
      });
    });

    it('can associate with a user', function(done) {
      var rt = new model({
        id: uuid.v4(),
        user_id: user.id
      });
      model.create(rt, function(err, result) {
        if (err) throw err;

        rt.getUser(function(err, got_user) {
          if (err) throw err;
          expect(got_user.id).toEqual(user.id);
          done();
        });
      });
    });

  });

});