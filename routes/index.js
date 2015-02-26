var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.models.headcount.count(function (err, status) {
    if (err) {
      res.status(500).send('Something broke!' + err)
    } else {
      res.render('index', {
        title: 'Express',
        count: status
      });
    }
  })
});

module.exports = router;
