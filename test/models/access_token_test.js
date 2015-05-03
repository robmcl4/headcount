var h = require('../helper');
var db = h.db;
var expect = require('expect');
var uuid = require('node-uuid');
var moment = require('moment');

describe('access_token', function() {
  var model = db.models.access_token;

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

    it('has an expiry', function() {
      expect(properties.expiry).toExist();
      expect(properties.expiry.type).toEqual('date');
      expect(properties.expiry.time).toBe(true);
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
      var at = new model({
        id: uuid.v4(),
        user_id: user.id,
        expiry: new Date()
      });
      model.create(at, function(err, result) {
        if (err) throw err;

        at.getUser(function(err, got_user) {
          if (err) throw err;
          expect(got_user.id).toEqual(user.id);
          done();
        });
      });
    });

    it('loads back the correct date', function(done) {
      var at = new model({
        id: uuid.v4(),
        user_id: user.id,
        expiry: new Date()
      });
      model.create(at, function(err, result) {
        if (err) throw err;

        model.find({id: at.id}, function(err, result) {
          if (err) throw err;
          expect(result[0].expiry).toEqual(at.expiry);
          done();
        });
      });
    });

  });

});