/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , Strategy = require('../lib').FitbitOAuth2Strategy;

//Note: Based on https://github.com/jaredhanson/passport-facebook/blob/b4f1cff3c7391122535e0837ffcc63bd1d2a4a79/test/strategy.test.js
describe('Strategy', function() {
    
  describe('constructed', function() {
    var strategy = new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    
    it('should be named fitbit', function() {
      expect(strategy.name).to.equal('fitbit');
    });
  });

  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new Strategy(undefined, function(){});
      }).to.throw(Error);
    });
  });

  describe('authorization request without options', function() {
    var strategy = new Strategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});

    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate();
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=ABC123');
    });
  });

  describe('authorization request with extra parameters', function() {
    var strategy = new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
    
    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate({ foo: 'bar' });
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://www.fitbit.com/oauth2/authorize?foo=bar&response_type=code&client_id=ABC123');
    });
  });

  describe('authorization request with scopes', function() {
    var strategy = new Strategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});

    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate({ scope: 'weight profile' });
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://www.fitbit.com/oauth2/authorize?scope=weight%20profile&response_type=code&client_id=ABC123');
    });
  });

  describe('authorization request with scopes in array format', function() {
    var strategy = new Strategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});

    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate({ scope: ['weight','profile'] });
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://www.fitbit.com/oauth2/authorize?scope=weight%20profile&response_type=code&client_id=ABC123');
    });
  });

});
