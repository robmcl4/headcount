var h = require('../../helper');
var db = h.db;
var app = h.app;
var expect = require('expect');
var request = require('supertest');
var moment = require('moment');

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

    it('should return a headcount with its id, initials, how_many, and ts', function(done) {
      var h = new db.models.headcount({
        initials: 'FO',
        how_many: 20,
        ts: new Date()
      });
      db.models.headcount.create(h, function(err, result) {
        if (err) throw err;
        request(app)
          .get('/api/headcount/recent')
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body).toEqual([{
              id: h.id,
              initials: 'FO',
              how_many: 20,
              ts: moment(h.ts).format('YYYY-MM-DDTHH:mm')
            }]);
            done();
          });        
      });
    });

    it('should return a list sorted by ts, then by id (greatest to least)');

    it('should limit to 25 headcounts if no limit supplied');

    it('should limit to 25 headcounts if limit supplied is above 25');

    it('should limit to the supplied limit when supplied');

  });

  describe('POST /', function() {

    beforeEach('remove all old headcounts', function(done) {
      h.clearModel(db.models.headcount, function(err) {
        if (err) throw err;
        done();
      })
    });

    it('errors when parameters are missing', function(done) {
      request(app)
        .post('/api/headcount')
        .send({})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.status).toEqual(400);
          expect(res.body).toEqual({
            message: 'Parameters missing'
          });
          done();
        });
    });

    it('creates a new headcount with the supplied information', function(done) {
      var now = new Date();
      now.setSeconds(0);
      now.setMilliseconds(0);
      request(app)
        .post('/api/headcount')
        .send({
          initials: 'RM',
          how_many: 20,
          ts: moment(now).format('YYYY-MM-DDTHH:mm')
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) throw err;
          // make sure a new headcount was made
          db.models.headcount.all(function(err, res) {
            if (err) throw err;
            expect(res.length).toEqual(1);
            expect(res[0].initials).toEqual('RM');
            expect(res[0].how_many).toEqual(20);
            expect(res[0].ts).toEqual(now);
            done();
          });
        });
    });

  });

  describe('GET /day_summary', function() {

    it('describes the mean and std deviation of headcounts for a given day');

  });

  describe('GET /headcount.csv', function() {

    it('downloads a CSV file of of the headcount data');

  });

});