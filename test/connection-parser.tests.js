var expect = require('chai').expect;
var connectionParser = require('../lib/connection-parser');

describe('connection parser', function () {
  it('should parse replicasets', function () {
    var r = connectionParser('mongodb://j:p@[repl1=server1:27018,server2:27017]/mydb');

    expect(r.rs_name)
      .to.equal('repl1');

    expect(r.replicants[0].host)
      .to.equal('server1');

    expect(r.replicants[0].port)
      .to.equal(27018);

    expect(r.replicants[1].host)
      .to.equal('server2');

    expect(r.user)
      .to.equal('j');

    expect(r.password)
      .to.equal('p');
  });

  it('should parse without port', function () {
    var r = connectionParser('mongodb://j:p@[repl1=server1:27018,server2]/mydb');

    expect(r.replicants[1].port)
      .to.equal(27017);

  });
});