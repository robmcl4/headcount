var express = require('express');
var router = express.Router();

/* GET /api/headcount/recent */
router.get('/headcount/recent', function(req, res, next) {
  var limit = Math.max(Math.min(parseInt(req.query.limit) || 25, 25), 1);
  req.models.headcount.find(['ts', 'Z'], limit, function(err, headcounts) {
    if (err)
      next(err);
    else 
      res.json(headcounts);
  });
});


/* POST /api/headcount */
router.post('/headcount', function(req, res, next) {

});

module.exports = router;
