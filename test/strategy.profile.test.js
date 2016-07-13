/* global describe, it, before, expect */
/* jshint expr: true */

var Strategy = require('../lib').FitbitOAuth2Strategy;

//Note: Based on https://github.com/jaredhanson/passport-facebook/blob/35662267f19773314eabc3976906403564426b20/test/strategy.profile.test.js
describe('Strategy#userProfile', function() {
    
  describe('fetched from default endpoint', function() {
    var strategy = new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    var fitbitProfileRaw = '{"user":{"age":36,"avatar":"https://static0.fitbit.com/images/profile/defaultProfile_100_male.gif","avatar150":"https://static0.fitbit.com/images/profile/defaultProfile_150_male.gif","averageDailySteps":0,"corporate":false,"corporateAdmin":false,"country":"ES","dateOfBirth":"1980-02-01","displayName":"Homer","distanceUnit":"METRIC","encodedId":"AAA111","features":{"exerciseGoal":true},"foodsLocale":"es_ES","fullName":"Homer Simpson","gender":"MALE","glucoseUnit":"METRIC","height":172,"heightUnit":"METRIC","locale":"es_ES","memberSince":"2016-06-09","offsetFromUTCMillis":7200000,"startDayOfWeek":"MONDAY","strideLengthRunning":89.5,"strideLengthRunningType":"default","strideLengthWalking":71.4,"strideLengthWalkingType":"default","timezone":"Europe/Madrid","topBadges":[],"waterUnit":"METRIC","waterUnitName":"ml","weight":67,"weightUnit":"METRIC"}}';

    strategy._oauth2.get = function(url, accessToken, callback) {
      expect(url).to.equal('https://api.fitbit.com/1/user/-/profile.json');
      expect(accessToken).to.equal('token');
      callback(null, fitbitProfileRaw, undefined);

    };

    var useAuthorizationHeaderforGET_called = false;
    strategy._oauth2.useAuthorizationHeaderforGET = function(use) {
      expect(use).to.be.true;
      useAuthorizationHeaderforGET_called = true;
    };

    var profile;
    
    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });

    it('should use auth header for get', function() {
      expect(useAuthorizationHeaderforGET_called).to.be.true;
    });
    
    it('should parse profile', function() {
      expect(profile.provider).to.equal('fitbit');
      
      expect(profile.id).to.equal('AAA111');
      expect(profile.displayName).to.equal('Homer');
    });
    
    it('should set json property', function() {
      expect(profile._json).to.be.eql(JSON.parse(fitbitProfileRaw));
    });
  });
  
  describe('error caused by invalid token', function() {
    var strategy =  new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = '{"errors":[{"errorType":"invalid_token","message":"Access token invalid: token. Visit https://dev.fitbit.com/docs/oauth2 for more information on the Fitbit Web API authorization process."}],"success":false}';
  
      callback({ statusCode: 401, data: body });
    };
      
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      //TODO: Library should check Fitbit error, similar to: https://github.com/jaredhanson/passport-fitbit/blob/master/lib/strategy.js#L86
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('failed to fetch user profile');
    });

    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });

  });
  
  describe('error caused by malformed response', function() {
    var strategy =  new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    };
    
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      //TODO: Library should raise specific error about parsing
      expect(err).to.be.an.instanceOf(SyntaxError);
    });

    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  });
  
  describe('internal error', function() {
    var strategy = new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    };
    
    var err, profile;
    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
    
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });
    
    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  });
  
});
