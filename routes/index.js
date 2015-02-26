var express = require('express');
var router = express.Router();
var pg = require('pg');

/* GET home page. */
router.get('/', function(req, res, next) {
  pg.connect(function(err, client, done) {
    if (err) {
      res.status(500).send('Database connection error');
    }
    else {
      res.render('index', { title: 'Express' });
    }
    done();
  })
});

module.exports = router;
