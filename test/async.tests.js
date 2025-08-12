const getDb  = require('./..');
const expect = require('chai').expect;
const {
  MongoMemoryServer,
  MongoMemoryReplSet
} = require("mongodb-memory-server");

describe('getDb (Async/Promise)', function () {

  describe("single instance", () => {
    let mongod;
    let testUri;

    before(async () => {
      mongod = await MongoMemoryServer.create();
      testUri = mongod.getUri("getdb-test");
    });

    after(async () => {
      await mongod.stop();
    })

    describe("with basic init (async)", function () {
      let db;

      before(async function () {
        getDb.init(testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });

        db = await getDb();
      });

      it("should return a connected db", function () {
        expect(db).to.not.be.undefined;
        expect(db.databaseName).to.equal("getdb-test");
      });

      it("should return always same client instance", async function () {
        const secondCallDb = await getDb();
        // shares the client connection from the pool but different DB instances
        expect(secondCallDb.client).to.equal(db.client);
      });
    });

    describe("error handling (async)", function () {
      it("should reject the promise with error", async function () {
        const bad = "mongodb://127.0.0.1:9287";
        getDb.init("bad", bad, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
        
        try {
          await getDb("bad");
          expect.fail("Should have thrown an error");
        } catch (err) {
          expect(err.message).to.contain("connect ECONNREFUSED");
        }
      });

      it("should resolve with the db when using direct connection string", async function () {
        const db = await getDb(testUri);
        expect(db).to.be.ok;
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe('with env "DB" (async)', function () {
      before(function () {
        process.env.DB = testUri;
        getDb.init();
      });

      after(function () {
        delete process.env.DB;
      });

      it("should work", async function () {
        const db = await getDb();
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe("without init (async)", function () {
      after(function () {
        delete process.env.DB;
      });

      it("should work", async function () {
        const db = await getDb(testUri);
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe("promise chaining", function () {
      before(function () {
        getDb.init(testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
      });

      it("should work with .then() syntax", function (done) {
        getDb()
          .then(db => {
            expect(db).to.not.be.undefined;
            expect(db.databaseName).to.equal("getdb-test");
            done();
          })
          .catch(done);
      });

      it("should work with .catch() for errors", function (done) {
        const bad = "mongodb://127.0.0.1:9287";
        getDb.init("bad", bad, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });

        getDb("bad")
          .then(() => {
            done(new Error("Should have thrown an error"));
          })
          .catch(err => {
            expect(err.message).to.contain("connect ECONNREFUSED");
            done();
          });
      });

      it("should work with async/await in arrow functions", async () => {
        const db = await getDb();
        expect(db).to.not.be.undefined;
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe("mixed usage patterns", function () {
      before(function () {
        getDb.init(testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
      });

      it("should work with callback and promise in the same test suite", async function () {
        // Test callback version
        const callbackPromise = new Promise((resolve, reject) => {
          getDb((db) => {
            try {
              expect(db).to.not.be.undefined;
              resolve(db);
            } catch (err) {
              reject(err);
            }
          });
        });

        const callbackDb = await callbackPromise;

        // Test promise version
        const promiseDb = await getDb();

        // Both should return the same client
        expect(promiseDb.client).to.equal(callbackDb.client);
      });

      it("should work with alias parameter in async mode", async function () {
        getDb.init("test-alias", testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });

        const db = await getDb("test-alias");
        expect(db).to.not.be.undefined;
        expect(db.databaseName).to.equal("getdb-test");
      });
    });
  });

  describe('repl-set', () => {
    let replset;
    let testUri;

    before(async () => {
      replset = await MongoMemoryReplSet.create({ replSet: { count: 4 } }); // This will create an ReplSet with 4 members
      testUri = replset.getUri("getdb-test");
    });

    after(async () => {
      await replset.stop();
    });
    
    describe("with basic init (async)", function () {
      let db;

      before(async function () {
        getDb.init(testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });

        db = await getDb();
      });

      it("should return a connected db", function () {
        expect(db).to.not.be.undefined;
        expect(db.databaseName).to.equal("getdb-test");
      });

      it("should return always same client instance", async function () {
        const secondCallDb = await getDb();
        // shares the client connection from the pool but different DB instances
        expect(secondCallDb.client).to.equal(db.client);
      });
    });

    describe("error handling (async)", function () {
      it("should reject the promise with error", async function () {
        const bad = "mongodb://127.0.0.1:9287";
        getDb.init("bad", bad, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
        
        try {
          await getDb("bad");
          expect.fail("Should have thrown an error");
        } catch (err) {
          expect(err.message).to.contain("connect ECONNREFUSED");
        }
      });

      it("should resolve with the db when using direct connection string", async function () {
        const db = await getDb(testUri);
        expect(db).to.be.ok;
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe('with env "DB" (async)', function () {
      before(function () {
        process.env.DB = testUri;
        getDb.init();
      });

      after(function () {
        delete process.env.DB;
      });

      it("should work", async function () {
        const db = await getDb();
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe("without init (async)", function () {
      after(function () {
        delete process.env.DB;
      });

      it("should work", async function () {
        const db = await getDb(testUri);
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe("promise chaining", function () {
      before(function () {
        getDb.init(testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
      });

      it("should work with .then() syntax", function (done) {
        getDb()
          .then(db => {
            expect(db).to.not.be.undefined;
            expect(db.databaseName).to.equal("getdb-test");
            done();
          })
          .catch(done);
      });

      it("should work with .catch() for errors", function (done) {
        const bad = "mongodb://127.0.0.1:9287";
        getDb.init("bad", bad, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });

        getDb("bad")
          .then(() => {
            done(new Error("Should have thrown an error"));
          })
          .catch(err => {
            expect(err.message).to.contain("connect ECONNREFUSED");
            done();
          });
      });

      it("should work with async/await in arrow functions", async () => {
        const db = await getDb();
        expect(db).to.not.be.undefined;
        expect(db.databaseName).to.equal("getdb-test");
      });
    });

    describe("mixed usage patterns", function () {
      before(function () {
        getDb.init(testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });
      });

      it("should work with callback and promise in the same test suite", async function () {
        // Test callback version
        const callbackPromise = new Promise((resolve, reject) => {
          getDb((db) => {
            try {
              expect(db).to.not.be.undefined;
              resolve(db);
            } catch (err) {
              reject(err);
            }
          });
        });

        const callbackDb = await callbackPromise;

        // Test promise version
        const promiseDb = await getDb();

        // Both should return the same client
        expect(promiseDb.client).to.equal(callbackDb.client);
      });

      it("should work with alias parameter in async mode", async function () {
        getDb.init("test-alias", testUri, {
          serverSelectionTimeoutMS: 500,
          socketTimeoutMS: 500
        });

        const db = await getDb("test-alias");
        expect(db).to.not.be.undefined;
        expect(db.databaseName).to.equal("getdb-test");
      });
    });
  });

  describe("return type validation", function () {
    let mongod;
    let testUri;

    before(async () => {
      mongod = await MongoMemoryServer.create();
      testUri = mongod.getUri("getdb-test");
    });

    after(async () => {
      await mongod.stop();
    });

    it("should return a Promise when no callback is provided", function () {
      getDb.init(testUri);
      const result = getDb();
      expect(result).to.be.instanceOf(Promise);
    });

    it("should return undefined when callback is provided", function () {
      getDb.init(testUri);
      const result = getDb(() => {});
      expect(result).to.be.undefined;
    });

    it("should return a Promise when alias is provided but no callback", function () {
      getDb.init("test", testUri);
      const result = getDb("test");
      expect(result).to.be.instanceOf(Promise);
    });
  });
});
