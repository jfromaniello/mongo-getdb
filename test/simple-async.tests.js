const getDb  = require('./..');
const expect = require('chai').expect;
const { MongoMemoryServer } = require("mongodb-memory-server");

describe('getDb Promise Functionality', function () {
  let mongod;
  let uri;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri("getdb-test");
  });

  after(async () => {
    await mongod.stop();
  });

  it("should return a Promise when no callback is provided", function () {
    getDb.init(uri);
    const result = getDb();
    expect(result).to.be.instanceOf(Promise);
  });

  it("should return undefined when callback is provided", function () {
    getDb.init(uri);
    const result = getDb(() => {});
    expect(result).to.be.undefined;
  });

  it("should work with async/await", async function () {
    getDb.init(uri, {
      serverSelectionTimeoutMS: 500,
      socketTimeoutMS: 500
    });

    const db = await getDb();
    expect(db).to.not.be.undefined;
    expect(db.databaseName).to.equal("getdb-test");
  });

  it("should work with Promise.then()", function (done) {
    getDb.init(uri, {
      serverSelectionTimeoutMS: 500,
      socketTimeoutMS: 500
    });

    getDb()
      .then(db => {
        expect(db).to.not.be.undefined;
        expect(db.databaseName).to.equal("getdb-test");
        done();
      })
      .catch(done);
  });

  it("should work with direct connection string", async function () {
    const db = await getDb(uri);
    expect(db).to.be.ok;
    expect(db.databaseName).to.equal("getdb-test");
  });

  it("should handle errors properly", async function () {
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
});
