var h = require('../helper');
var db = h.db;
var assert = require('assert');

describe('Headcount', function() {
  var model = db.models.headcount;
  describe('Properties', function() {
    var properties = model.properties;

    it('should have an id', function() {
      assert(properties.hasOwnProperty('id'));
      assert.equal(properties.id.type, 'serial');
    });

    it('should have how_many', function() {
      assert(properties.hasOwnProperty('how_many'));
      assert.equal(properties.how_many.type, 'integer');
      assert.equal(properties.how_many.size, 4);
    });

    it('should have timestamp (ts)', function() {
      assert(properties.hasOwnProperty('ts'));
      assert.equal(properties.ts.type, 'date');
      assert.equal(properties.ts.time, true);
    });

    it('should have initials', function() {
      assert(properties.hasOwnProperty('initials'));
      assert.equal(properties.initials.type, 'text');
      assert.equal(properties.initials.size, 10);
    });

    it('should have id as the key', function() {
      assert.deepEqual(model.keys, ['id']);
    });
  });

  describe('persistance', function() {

    function makeHeadcount() {
      return new model({
        how_many: 2,
        initials: 'JF',
        timestamp: Date()
      });
    }

    it('should be able to save a model', function(done) {
      var h = makeHeadcount();
      model.create(h, function(err, results) {
        if (err)
          throw err;
        assert.notEqual(h.id, null);
        assert.notEqual(h.id, undefined);
        done();
      })
    });

    it('should save and load the same date', function(done) {
      var h = makeHeadcount();

      model.create(h, function(err, results) {
        if (err)
          throw err;

        var id = h.id;
        model.find({id: id}, function(err, results) {
          if (err)
            throw err;
          assert.equal(results.length, 1, 'should have found 1 mode');
          assert.equal(results[0].ts, h.ts);
          done();
        });

      });

    });

  });

});
