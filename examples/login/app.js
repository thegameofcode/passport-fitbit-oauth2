var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var FitbitStrategy = require('./lib').FitbitOAuth2Strategy;
var passport = require('passport');
var app = express();

app.use(cookieParser());
app.use(bodyParser());

app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session({
  resave: false,
  saveUninitialized: true
}));

const CLIENT_ID = '<YOUR_CLIENT_ID>';
const CLIENT_SECRET = '<YOUR_CLIENT_SECRET>';

app.use(passport.initialize());

var fitbitStrategy = new FitbitStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  scope: ['activity','heartrate','location','profile'],
  callbackURL: "http://localhost:3000/auth/fitbit/callback"
}, function(accessToken, refreshToken, profile, done) {
  // TODO: save accessToken here for later use

  done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });

});

passport.use(fitbitStrategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var fitbitAuthenticate = passport.authenticate('fitbit', {
  successRedirect: '/auth/fitbit/success',
  failureRedirect: '/auth/fitbit/failure'
});

app.get('/auth/fitbit', fitbitAuthenticate);
app.get('/auth/fitbit/callback', fitbitAuthenticate);

app.get('/auth/fitbit/success', function(req, res, next) {
  res.send(req.user);
});

app.listen(3000);
