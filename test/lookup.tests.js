var connectionLookup = require('../lib/connection-lookup');
var expect           = require('chai').expect;

describe('connection lookup', function () {
  beforeEach(function () {
    connectionLookup.init(null);
    delete process.env.DB;
    delete process.env.MONGOLAB_URI;
    delete process.env.dasdsDSAdsadsa;
  });

  it('should fail when there is no connection url', function () {
    expect(connectionLookup.get)
      .to.throw('missing connection url, environment variable or init call to mongo-getdb');    
  });

  it('should return the data when using init', function () {
    connectionLookup.init('mongodb://localhost/test');
    var result = connectionLookup.get();

    expect(result.host).to.equal('localhost');
    expect(result.port).to.equal(27017);
  });

  it('should return with alias', function () {
    connectionLookup.init({
      foo: 'mongodb://localhost/foo',
      bar: 'mongodb://localhost/bar'
    });
    expect(connectionLookup.get('foo').name).to.equal('foo');
    expect(connectionLookup.get('bar').name).to.equal('bar');
  });

  it('should return from env "DB"', function () {
    process.env.DB = 'mongodb://myhost/baba';

    expect(connectionLookup.get().host)
      .to.equal('myhost');
  });

  it('should return from env "MONGOLAB_URI"', function () {
    process.env.MONGOLAB_URI = 'mongodb://myhost/baba';

    expect(connectionLookup.get().host)
      .to.equal('myhost');
  });

  it('should return from first env starting with "mongodb://"', function () {
    process.env.dasdsDSAdsadsa = 'mongodb://fufafe/baba';

    expect(connectionLookup.get().host)
      .to.equal('fufafe');
  });

  it('should fail when there is no url for the alias', function () {
    expect(connectionLookup.get.bind(null, 'wrong alias'))
      .to.throw('there is no mongodb url for the alias "wrong alias"');
  });

  it('should return the parsed url when alias is url', function () {
    expect(connectionLookup.get('mongodb://mama.com/foo').host)
      .to.equal('mama.com');
  });
});