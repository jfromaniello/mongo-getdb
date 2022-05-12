const legacyHapi = require('../legacy-hapi');
const expect = require("chai").expect;

describe('legacy hapi', () => {
  const getDb = () => {
    throw new Error("STUB!")
  };

  it('should return plugin format', () => {
    expect(legacyHapi(getDb)).itself.to.respondTo('register');
  });

  it('should return plugin attributes', () => {
    expect(legacyHapi(getDb).register.attributes).to.have.property(
      "pkg",
      require("../package")
    );
  });

  it('should register plugin', (done) => {
    const db = {};
    const getDb = (callback) => callback(db);
    const exposed = {};
    const plugin = {
      expose: (key, value) => exposed[key] = value
    }
    legacyHapi(getDb).register(plugin, {}, () => {
      expect(exposed).to.deep.equal({
        db,
        getDb
      })
      done();
    });
  });
});