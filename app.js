var express                 = require('express');
var path                    = require('path');
var favicon                 = require('serve-favicon');
var logger                  = require('morgan');
var cookieParser            = require('cookie-parser');
var bodyParser              = require('body-parser');
var mongoose                = require('mongoose');
var session                 = require('express-session');
var flash                   = require('express-flash-messages')
 
var MongoStore = require('connect-mongo')(session);


var index                   = require('./routes/index');
var entries                 = require('./routes/entries');
var issues                 = require('./routes/issues');


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/passport_local_mongoose_express4');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static('public'));

app.use(flash())

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'fdafdsafdsafdasfdat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/entries', entries);
app.use('/issues', issues);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose

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
  console.log('req.user aaaa', req.user);
  req.session.count = req.session.count || 1
  req.session.count++
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
