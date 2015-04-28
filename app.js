var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var orm = require('orm');
require('dotenv').load();

var routes = require('./routes/index');
var headcount = require('./routes/api/headcount');
var app_models = require('./models/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(orm.express(
          process.env.DATABASE_URL || ('postgresql://' +
          process.env.PSQL_USER + ':' +
          process.env.PSQL_PASS + '@' +
          process.env.PSQL_HOST + '/' +
          process.env.PSQL_DB) +
          '?pool=true?timezone=UTC',
          {
            define: function(db, models, next) {
              app_models.define(db, models);
              next();
            }
          })
);

app.use('/', routes);
app.use('/api/headcount', headcount);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
