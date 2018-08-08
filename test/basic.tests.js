var getDb  = require('./..');
var expect = require('chai').expect;

describe('getDb', function () {
  describe('with basic init', function () {
    var db;

    before(function (done) {
      getDb.init('mongodb://dev:dev@mongo:27017/admin', {
        server: {
          poolSize: 10,
          socketOptions: {
            connectTimeoutMS: 500,
            keepAlive: 300
          }
        }
      });

      getDb(function (theDb) {
        db = theDb;
        done();
      });
    });

    it('should return a connected db', function () {
      expect(db.client.isConnected())
        .to.be.true;

      expect(db.databaseName)
        .to.equal('admin');
    });

    it('should have auto_reconnect', function () {
      expect(db.topology.s.reconnect)
        .to.be.true;
    });

    it('should have poolSize 10', function () {
      expect(db.client.s.options.poolSize).to.equal(10);
    });

    it('shuld return always same instance', function (done) {
      getDb(function (secondCallDb) {
        expect(secondCallDb).to.equal(db);
        done();
      });
    });
  });

  describe('error in callback', function () {
    it('should return the error object', function (done) {
      getDb('mongodb://127.0.0.1:9287', function (err, db) {
        expect(err.message).to.contain('connect ECONNREFUSED');
        expect(db).to.be.undefined;
        done();
      });
    });

    it('should return the db in the second parameter', function (done) {
      getDb('mongodb://dev:dev@mongo:27017/db?authSource=admin', function (err, db) {
        expect(err).to.null;
        expect(db).to.be.ok;
        done();
      });
    });

  });

  describe('with env "DB"', function () {
    before(function () {
      process.env.DB = 'mongodb://dev:dev@mongo:27017/db?authSource=admin';
      getDb.init();
    });

    after(function () {
      delete process.env.DB;
    });

    it('should work', function (done) {
      getDb(function (db) {
        expect(db.databaseName)
          .to.equal('db');
        done();
      });
    });
  });

  describe('without init', function () {

    after(function () {
      delete process.env.DB;
    });

    it('should work', function (done) {
      getDb('mongodb://dev:dev@mongo:27017/db?authSource=admin', function (db) {
        expect(db.databaseName)
          .to.equal('db');
        done();
      });
    });
  });
});