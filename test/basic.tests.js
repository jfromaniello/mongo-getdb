var getDb  = require('./..');
var expect = require('chai').expect;

describe('getDb', function () {
  describe('with basic init', function () {
    var db;

    before(function (done) {
      getDb.init({url: 'mongodb://localhost/foo'});
      getDb(function (theDb) {
        db = theDb;
        done();
      })
    });

    it('should return a connected db', function () {
      expect(db.serverConfig.isConnected())
        .to.be.true;

      expect(db.databaseName)
        .to.equal('foo');
    });

    it('should have auto_reconnect', function () {
      expect(db.serverConfig.options.auto_reconnect)
        .to.be.true;
    });

    it('should have the socket keepAlive', function () {
      expect(db.serverConfig.options.socketOptions.keepAlive)
        .to.equal(300);
    });

    it('should have poolSize 10', function () {
      expect(db.serverConfig.options.poolSize)
        .to.equal(10);
    });

    it('shuld return always same instance', function (done) {
      getDb(function (secondCallDb) {
        expect(secondCallDb).to.equal(db);
        done();
      });
    });
  });

  describe('with env "DB"', function () {
    before(function () {
      getDb.init({url:null});
      process.env.DB = 'mongodb://localhost/HAA';
    });
    
    after(function () {
      delete process.env.DB;
    });

    it('should work', function (done) {
      getDb(function (db) {
        expect(db.databaseName)
          .to.equal('HAA');
        done();
      });
    });
  });

  describe('with url as alias', function () {
    it('should work', function (done) {
      getDb('mongodb://localhost/foobar', function (db) {
        expect(db.databaseName)
          .to.equal('foobar');
        done();
      });
    });
  });

});