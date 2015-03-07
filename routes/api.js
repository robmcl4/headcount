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
  if (how_many === undefined || ts === undefined) {
    next('Parameters missing');
  }
  else {
    var newHeadcount = {how_many: how_many, ts: ts};
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

module.exports = router;
