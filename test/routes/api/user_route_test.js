var h = require('../../helper');
var db = h.db;
var app = h.app;
var expect = require('expect');
var request = require('supertest');
var crypto = require('crypto');
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
                // make sure the access token decrypts to the right value
                var components = res.body.access_token.split('|');
                var payload = components[0];
                var iv = components[1];
                var hmac = components[2];
                // make sure hmac matches
                expect(getHmacFor(payload + '|' + iv)).toEqual(hmac);
                // decrypt the payload and make sure it says things
                var payload = decryptPayload(payload, new Buffer(iv, 'base64'));
                expect(payload).toExist();
                expect(payload.user_id).toEqual(user.id);
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

// ugh, these are just copy-pasted from /routes/api/users.js for now,
// TODO make these nicer?
var private_key = process.env.PRIVATE_KEY || 'xoCyO5omMAg5BYMrGta3c5aTYs8i6rHSqDr5uoXhl5d9N22j3wuXjI30mCZW';
var hmac_key = crypto.pbkdf2Sync(private_key, 'hmac', 10000, 128, 'sha256').toString('hex');
var encrypt_key = crypto.pbkdf2Sync(private_key, 'encrypt_key', 10000, 24, 'sha256');

function getHmacFor(s) {
  var hmac = crypto.createHmac('sha256', hmac_key);
  hmac.update(s);
  return hmac.digest('base64');
}


function decryptPayload(s, iv) {
  var decipher = crypto.createDecipheriv('AES192', encrypt_key, iv);
  var ret = decipher.update(s, 'base64', 'ascii');
  return JSON.parse(ret + decipher.final('ascii'));
}