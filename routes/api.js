var express = require('express');
var router = express.Router();

/* GET /api/headcounts/recent */
router.get('/headcount/recent', function(req, res, next) {
  var limit = Math.max(Math.min(parseInt(req.query.limit) || 25, 25), 1);
  req.models.headcount.find(['ts', 'Z'], limit, function(err, headcounts) {
    if (err)
      next(err);
    else 
      res.json(headcounts);
  });
});

module.exports = router;
