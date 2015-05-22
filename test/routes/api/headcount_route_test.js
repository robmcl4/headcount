var h = require('../../helper');
var db = h.db;
var app = h.app;
var expect = require('expect');
var request = require('supertest');
var moment = require('moment');

describe('/api/headcount', function() {

  describe('/recent', function() {

    // function to make a ton of headcounts
    function makeHeadcounts(numLeft, cb) {
      if (numLeft <= 0) return cb();
      var hc = {
        initials: 'FO',
        ts: moment().add(Math.round(Math.random()*5), 'hours').toDate(),
        how_many: 20
      };
      db.models.headcount.create(hc, function(err, res) {
        if (err) throw err;
        return makeHeadcounts(numLeft-1, cb);
      });
    }

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
          expect(res.body).toEqual({
            headcounts: [],
            page: 0,
            total_pages: 0
          });
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
            expect(res.body.headcounts).toEqual([{
              id: h.id,
              initials: 'FO',
              how_many: 20,
              ts: moment(h.ts).format('YYYY-MM-DDTHH:mm')
            }]);
            expect(res.body.total_pages).toEqual(1);
            expect(res.body.page).toEqual(0);
            done();
          });
      });
    });

    it('should return a list sorted by ts, then by id (greatest to least)', function(done) {
      makeHeadcounts(25, function() {
        request(app)
          .get('/api/headcount/recent')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body.headcounts.length).toBeGreaterThan(10);
            for(var i=0; i<res.body.headcounts.length-1; i++) {
              var curr = res.body.headcounts[i];
              var next = res.body.headcounts[i+1];
              // the date closer to the front should be the same as, or after
              // the one closer to the end of the list
              expect(moment(curr.ts).isBefore(next.ts)).toNotEqual(true);
              if (moment(curr.ts).isSame(next.ts)) {
                expect(curr.id).toBeGreaterThan(next.id);
              }
            }
            done();
          });
      });
    });

    it('should limit to 25 headcounts if no limit supplied', function(done) {
      makeHeadcounts(26, function() {
        request(app)
          .get('/api/headcount/recent')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body.headcounts.length).toEqual(25);
            expect(res.body.total_pages).toEqual(2);
            expect(res.body.page).toEqual(0);
            done();
          });
      });
    });

    it('should limit to 25 headcounts if limit supplied is above 25', function(done) {
      makeHeadcounts(26, function() {
        request(app)
          .get('/api/headcount/recent')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body.headcounts.length).toEqual(25);
            expect(res.body.total_pages).toEqual(2);
            expect(res.body.page).toEqual(0);
            done();
          });
      });
    });

    it('should limit to the supplied limit when supplied', function(done) {
      makeHeadcounts(10, function() {
        request(app)
          .get('/api/headcount/recent?limit=4')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body.headcounts.length).toEqual(4);
            expect(res.body.total_pages).toEqual(3);
            expect(res.body.page).toEqual(0);
            done();
          });
      });
    });

    it('accepts a page number', function(done) {
      makeHeadcounts(10, function() {
        request(app)
          .get('/api/headcount/recent?limit=4&offset=0')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end(function(err, res1) {
            if (err) throw err;
            request(app)
              .get('/api/headcount/recent?limit=4&page=1')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .end(function(err, res2) {
                if (err) throw err;
                expect(res2.body.headcounts.length).toEqual(4);
                expect(res2.body.page).toEqual(1);
                expect(res2.body.total_pages).toEqual(3);
                // expect none of res1 and res2 ids to overlap
                for (var i = 0; i<res1.body.headcounts.length; i++) {
                  for (var j = 0; j<res2.body.headcounts.length; j++) {
                    expect(res1.body.headcounts[i].id)
                      .toNotEqual(res2.body.headcounts[j].id);
                  }
                }
                done();
              });
          });
      });
    });

  });

  describe('POST /', function() {

    beforeEach('remove all old headcounts', function(done) {
      h.clearModel(db.models.headcount, function(err) {
        if (err) throw err;
        db.models.headcount.count(function(err, c) {
          if (err) throw err;
          if (c) throw new Error(c + ' models still exist');
          done();
        });
        // done();
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
            error: 'Parameters missing'
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