var h = require('../helper');
var db = h.db;
var expect = require('expect');

describe('user', function() {
  var model = db.models.user;

  describe('properties', function() {
    var properties = model.properties;

    it('should have an id', function() {
      expect(properties.id).toExist();
      expect(properties.id.type).toEqual('serial');
    });

    it('should have a username', function() {
      expect(properties.username).toExist();
      expect(properties.username.type).toEqual('text');
      expect(properties.username.size).toEqual(20);
    });

    it('should have a hash', function() {
      expect(properties.hash).toExist();
      expect(properties.hash.type).toEqual('text');
      expect(properties.hash.size).toEqual(128);
    });

    it('should have a salt', function() {
      expect(properties.salt).toExist();
      expect(properties.salt.type).toEqual('text');
      expect(properties.salt.size).toEqual(16);
    });

    it('should have is_admin', function() {
      expect(properties.is_admin).toExist();
      expect(properties.is_admin.type).toEqual('boolean');
    });
  });

  describe('methods', function() {

    describe('_generateSalt()', function() {

      it('should generate a new salt of 16 characters', function(done) {
        var u = new model();
        expect(u.salt).toNotExist();
        u._generateSalt(function() {
          expect(u.salt).toExist();
          expect(u.salt.length).toEqual(16);
          done();
        });
      });

      it('should not override an original salt', function(done) {
        var u = new model();
        u._generateSalt(function() {
          expect(u.salt).toExist();
          var oldSalt = u.salt;
          u._generateSalt(function() {
            expect(u.salt).toEqual(oldSalt);
            done();
          });
        });
      });

    });

    describe('setPassword()', function() {

      it('should also generate a salt if not already set', function(done) {
        var u = new model();
        expect(u.salt).toNotExist();
        u.setPassword('foobar', function() {
          expect(u.salt).toExist();
          done();
        });
      });

      it('should populate the hash property with 128 characters', function(done) {
        var u = new model();
        u.setPassword('foobar', function() {
          expect(u.hash).toExist();
          expect(u.hash.length).toEqual(128);
          done();
        });
      });

      it('should change the password when one already exists', function(done) {
        var u = new model();
        u.setPassword('foobar', function() {
          var oldHash = u.hash;
          u.setPassword('baz', function() {
            expect(u.hash).toNotEqual(oldHash);
            done();
          });
        });
      });

    });

    describe('checkPassword()', function() {

      it('should return false when the password is incorrect', function(done) {
        var u = new model();
        u.setPassword('foobar', function() {
          u.checkPassword('foobar22', function(result) {
            expect(result).toBe(false);
            done();
          });
        });
      });

      it('should return true when password is correct', function(done) {
        var u = new model();
        u.setPassword('foobar', function() {
          u.checkPassword('foobar', function(result) {
            expect(result).toBe(true);
            done();
          });
        });
      });

    });

  });

});
