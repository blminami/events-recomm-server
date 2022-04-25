var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressJwt = require('express-jwt');
var mongoose = require('mongoose');
var logger = require('morgan');

mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost:27017/AppLicenta')
  .then(() => {
    console.log('connection successful');
  })
  .catch((err) => console.log(err));

var app = express();
process.env.FEBL_ACCESS_TOKEN = '526557774347625|rsk-MD_b5IGIYY3428uh4iHvqGs';
var db = mongoose.createConnection('localhost', 'AppLicenta', {
  native_parser: true
});
db.collection('events').createIndex({ 'place.location.coord': '2d' });

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://192.168.43.49:8100');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT, DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization '
  );
  next();
});

var User = require('./routes/users.js');
var Event = require('./routes/events.js');
var Preference = require('./routes/userPreferences.js');
var FacebookPublicEvents = require('./routes/facebookPublicEvents.js');
var ForgotPassword = require('./routes/forgotPassword');
var ResetPassword = require('./routes/resetPassword');
var NewEvents = require('./routes/newEvents');
var Notification = require('./routes/notifications');

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.set("host", process.env.HOST || "0.0.0.0");
app.set('host', '192.168.43.49');
app.set('port', process.env.PORT0 || 8080);
app.set('x-powered-by', false);
app.set('etag', false);

app.use(cookieParser());

app.use('/users', User);
app.use('/myEvents', Event);
app.use('/userPreferences', Preference);
app.use('/events', FacebookPublicEvents);
app.use('/forgotPassword', ForgotPassword);
app.use('/resetPassword', ResetPassword);
app.use('/newEvents', NewEvents);
app.use('/notification', Notification);

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8080);
