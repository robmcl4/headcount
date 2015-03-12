var express = require('express');
var router = express.Router();

/* GET /api/headcount/recent */
router.get('/headcount/recent', function(req, res, next) {
  var limit = Math.max(Math.min(parseInt(req.query.limit) || 25, 25), 1);
  req.models.headcount.find(['-ts', '-id'], limit, function(err, headcounts) {
    if (err)
      next(err);
    else
      res.json(headcounts);
  });
});


/* POST /api/headcount */
router.post('/headcount', function(req, res, next) {
  var how_many = req.body.how_many;
  var ts = req.body.ts;
  var initials = req.body.initials;
  if (how_many === undefined || ts === undefined || initials === undefined) {
    next('Parameters missing');
  }
  else {
    var newHeadcount = {how_many: how_many, initials: initials, ts: ts};
    req.models.headcount.create(newHeadcount, function(err, result) {
      if (err) {
        next(err);
      }
      else {
        res.json();
      }
    });
  }
});


/* GET /api/headcount/day_summary?day={mon, tues, wed, thur, fri, sat, sun} */
router.get('/headcount/day_summary', function(req, res, next) {
  var day = parseInt(req.query.day);

  if (day === undefined) {
    next('Parameters missing or malformed');
  } else {

    req.db.driver.execQuery(
      'SELECT '
      + 'EXTRACT(HOUR FROM ts) AS hour, '
      + 'AVG(how_many), '
      + 'STDDEV(how_many)'
      + 'FROM headcount WHERE EXTRACT(DOW FROM ts) = ? GROUP BY hour ORDER BY hour',
      day + '',
      function(err, result) {
        if (err)
          next(err);
        else {
          for (var i=0; i < result.length; i++) {
            result[i] = {
              hour: result[i].hour,
              avg: parseFloat(result[i].avg),
              stddev: parseFloat(result[i].stddev)
            }
          }
          res.json(result);
        }
    });
  }
});

module.exports = router;
