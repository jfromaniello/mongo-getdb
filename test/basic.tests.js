const getDb  = require('./..');
const expect = require('chai').expect;
const {
  MongoMemoryServer,
  MongoMemoryReplSet
} = require("mongodb-memory-server");
const [DB_NAME, DB_NAME_2] = ['getdb-test', 'getdb-test2']

let uri, uri2;

const behavesLikeGetDB = () => {
    describe("with basic init", function () {
      let db;

      before(function (done) {
        getDb.init(uri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });

        getDb(function (theDb) {
          db = theDb;
          done();
        });
      });

      it("should return a connected db", function () {
        expect(db).to.not.be.undefined;

        expect(db.databaseName).to.equal(DB_NAME);
      });

      it("should return always same client instance", function (done) {
        getDb(function (secondCallDb) {
          // shares the client connection from the pool but different DB instances
          expect(secondCallDb.client).to.equal(db.client);
          done();
        });
      });
    });

    describe("with multiple aliases", function () {
      before(function(done) {
        getDb.init(DB_NAME, uri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
        getDb.init(DB_NAME_2, uri2, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
        done();
      });

      it(`should return the good client instance for ${DB_NAME}`, function (done) {
        getDb(DB_NAME, function (db) {
          expect(db.databaseName).to.equal(DB_NAME)
          done();
        });
      });
      
      it(`should return the good client instance for ${DB_NAME_2}`, function (done) {
        getDb(DB_NAME_2, function (db) {
          expect(db.databaseName).to.equal(DB_NAME_2)
          done();
        });
      });
    });

    describe("with one alias and a default", function () {
      getDb.init(uri, {
        serverSelectionTimeoutMS: 500,
        socketTimeoutMS: 500
      });
      getDb.init(DB_NAME_2, uri2, {
        serverSelectionTimeoutMS: 500,
        socketTimeoutMS: 500
      });

      it("should return the good client for the default connection", function (done) {
        getDb(function (db) {
          expect(db.databaseName).to.equal(DB_NAME)
          done();
        });
      });

      it("should return the good client for the 'db2' connection", function (done) {
        getDb(DB_NAME_2, function (db) {
          expect(db.databaseName).to.equal(DB_NAME_2)
          done();
        });
      });
    });

    describe("error in callback", function () {
      it("should return the error object", function (done) {
        const bad = "mongodb://127.0.0.1:9287";
        getDb.init("bad", bad, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
        getDb("bad", function (err, db) {
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
          expect(db.databaseName).to.equal(DB_NAME);
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
          expect(db.databaseName).to.equal(DB_NAME);
          done();
        });
      });
    });
}

describe('getDb', function () {

  describe("single instances", () => {
    let mongod;

    before(async () => {
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri(DB_NAME);
      uri2 = mongod.getUri(DB_NAME_2);
    });

    after(async () => {
      await mongod.stop();
    })

    behavesLikeGetDB();
  });

  describe('repl-sets', () => {
    let replset;

    before(async () => {
      replset = await MongoMemoryReplSet.create({ replSet: { count: 4 } }); // This will create an ReplSet with 4 members

      uri = replset.getUri(DB_NAME);
      uri2 = replset.getUri(DB_NAME_2);
    });

    after(async () => {
      await replset.stop();
    });
    behavesLikeGetDB();
  });
});
