var h = require('../../helper');
var db = h.db;
var app = h.app;
var expect = require('expect');
var request = require('supertest');
var cryptoHelper = require('../../../lib/crypto_helper');
var moment = require('moment');


describe('/api/users', function() {

  describe('POST /token', function() {

    it('gives invalid request when username is omitted', function(done) {
      request(app)
        .post('/api/users/token')
        .type('form')
        .send({password: 'foobar', grant_type: 'password'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.status).toEqual(400);
          expect(res.body).toEqual({
            error: 'invalid_request'
          });
          done();
        });
    });

    it('gives invalid request when password is omitted', function(done) {
      request(app)
        .post('/api/users/token')
        .type('form')
        .send({username: 'foo', grant_type: 'password'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.status).toEqual(400);
          expect(res.body).toEqual({
            error: 'invalid_request'
          });
          done();
        });
    });

    it('gives invalid request when grant_type is not password', function(done) {
      request(app)
        .post('/api/users/token')
        .type('form')
        .send({username: 'foo', password: 'bar', grant_type: 'not_password'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.status).toEqual(400);
          expect(res.body).toEqual({
            error: 'invalid_request'
          });
          done();
        });
    });

    it('gives invalid grant when user is not found', function(done) {
      request(app)
        .post('/api/users/token')
        .type('form')
        .send({username: 'foo', password: 'bar', grant_type: 'password'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.status).toEqual(400);
          expect(res.body).toEqual({
            error: 'invalid_grant'
          });
          done();
        });
    });

    it('gives invalid grant when the given password is not valid', function(done) {
      clear_users(function() {
        make_user(function(user) {
          request(app)
            .post('/api/users/token')
            .type('form')
            .send({username: user.username, password: 'notthepassword', grant_type: 'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) throw err;
              expect(res.status).toEqual(400);
              expect(res.body).toEqual({
                error: 'invalid_grant'
              });
              done();
            });
        });
      });
    });

    it('returns a new access token and refresh token on success', function(done) {
      clear_users(function() {
        make_user(function(user) {
          request(app)
            .post('/api/users/token')
            .type('form')
            .send({username: user.username, password: 'password', grant_type: 'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) throw err;
              expect(res.status).toEqual(200);
              expect(res.body.access_token).toExist();
              expect(res.body.refresh_token.match(guidRegex)).toExist();
              expect(res.body.token_type).toEqual('bearer');
              expect(res.body.expires_in).toExist();
              // make sure the refresh token is in the database
              user.getRefresh_tokens(function(err, result) {
                if(err) throw err;
                expect(result.length).toEqual(1);
                expect(result[0].id).toEqual(res.body.refresh_token);
                // check the payload
                cryptoHelper.decryptAndCheckSig(res.body.access_token, function(err, payload) {
                  if (err) throw err;

                  expect(payload).toExist();
                  expect(payload.user_id).toEqual(user.id);
                  expect(payload.is_admin).toEqual(false);
                  expect(payload.expiry).toExist();
                  // expect an expiry in 6 hours
                  var expected_expiry = +moment().add(6, 'hours');
                  // no more than a 0.1s difference in expectation, ty
                  expect(Math.abs(expected_expiry - moment(payload.expiry))).toBeLessThan(100);
                  done();
                });
              });
            });
        });
      });
    });

  });

});

var guidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/i;

function clear_users(cb) {
  db.driver.execQuery('TRUNCATE TABLE "user" CASCADE', function(err, res) {
    if (err) throw err;
    cb();
  });
}

function make_user(cb) {
  var u = new db.models.user({
    username: 'username',
    is_admin: false
  });
  u.setPassword('password', function() {
    db.models.user.create(u, function(err, res) {
      if (err) throw err;
      cb(u);
    });
  });
}
