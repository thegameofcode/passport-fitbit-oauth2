# Passport strategy for Fitbit OAuth 2.0

[Passport](http://passportjs.org/) strategies for authenticating with [Fitbit](http://www.fitbit.com/)
using ONLY OAuth 2.0.

This module lets you authenticate using Fitbit in your Node.js [Express](http://expressjs.com/) (or [Connect](http://www.senchalabs.org/connect/)) server applications. 


## Install

    $ npm install passport-fitbit-oauth2

## Usage of OAuth 2.0

#### Configure Strategy

The Fitbit OAuth 2.0 authentication strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

```
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;;

passport.use(new FitbitStrategy({
    clientID:     FITBIT_CLIENT_ID,
    clientSecret: FITBIT_CLIENT_SECRET,
    callbackURL: "http://yourdormain:3000/auth/fitbit/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ fitbitId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'fitbit'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```
app.get('/auth/fitbit',
  passport.authenticate('fitbit', { scope: ['activity','heartrate','location','profile'] }
));

app.get( '/auth/fitbit/callback', passport.authenticate( 'fitbit', { 
        successRedirect: '/auth/fitbit/success',
        failureRedirect: '/auth/fitbit/failure'
}));
```
