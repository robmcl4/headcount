var h = require('../../helper');
var db = h.db;
var app = h.app;
var expect = require('expect');
var request = require('supertest');

describe('/api/headcount', function() {

  describe('/recent', function() {

    beforeEach('remove all old headcounts', function(done) {
      h.clearModel(db.models.headcount, function(err) {
        if (err) throw err;
        done();
      })
    });

    it('should return an empty list when no headcounts exist', function(done) {
      request(app)
        .get('/api/headcount/recent')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.body).toEqual([]);
          done();
        });
    });

  });

});