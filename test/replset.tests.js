const getDb = require("./..");
const expect = require("chai").expect;
const { MongoMemoryReplSet } = require("mongodb-memory-server");

describe("getDb - replset", function () {
  let replset, uri;

  before(async () => {
    replset = await MongoMemoryReplSet.create({ replSet: { count: 4 } }); // This will create an ReplSet with 4 members

    uri = replset.getUri();
  });

  after(async () => {
    await replset.stop();
  });

  describe("with basic init", function () {
    let db;

    before(function (done) {
      getDb.init(uri, {
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

    it("should return a connected db", function () {
      expect(db.client.isConnected()).to.be.true;

      expect(db.databaseName).to.equal("test");
    });

    it("should have poolSize 10", function () {
      expect(db.client.s.options.poolSize).to.equal(10);
    });

    it("shuld return always same instance", function (done) {
      getDb(function (secondCallDb) {
        expect(secondCallDb).to.equal(db);
        done();
      });
    });
  });

  describe("error in callback", function () {
    it("should return the error object", function (done) {
      getDb("mongodb://127.0.0.1:9287", function (err, db) {
        expect(err.message).to.contain("connect ECONNREFUSED");
        expect(db).to.be.undefined;
        done();
      });
    });

    it("should return the db in the second parameter", function (done) {
      getDb(uri, function (err, db) {
        expect(err).to.null;
        expect(db).to.be.ok;
        done();
      });
    });
  });

  describe('with env "DB"', function () {
    before(function () {
      process.env.DB = uri;
      getDb.init();
    });

    after(function () {
      delete process.env.DB;
    });

    it("should work", function (done) {
      getDb(function (db) {
        expect(db.databaseName).to.equal("test");
        done();
      });
    });
  });

  describe("without init", function () {
    after(function () {
      delete process.env.DB;
    });

    it("should work", function (done) {
      getDb(uri, function (db) {
        expect(db.databaseName).to.equal("test");
        done();
      });
    });
  });
});
