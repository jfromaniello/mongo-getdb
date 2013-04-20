var conns;
var connectionParser = require('./connection-parser');

exports.init = function (initData) {
  if (typeof initData == 'string') {
    conns = {'default': initData};
    return;
  }
  conns = initData;
};

exports.get = function (alias) {
  alias = alias || 'default';
  
  if (/^mongo(db)\:\/\//.exec(alias)) {
    return connectionParser(alias);
  }

  if (alias !== 'default' && (!conns || !(alias in conns))) {
    throw new Error('there is no mongodb url for the alias "' + alias + '"')
  }

  if (conns) {
    return connectionParser(conns[alias]);
  }

  if (process.env.DB) {
    return connectionParser(process.env.DB);
  }

  if (process.env.MONGOLAB_URI) {
    return connectionParser(process.env.MONGOLAB_URI);
  }

  var guessEnv = Object.keys(process.env).filter(function (k) {
    return /^mongo(db):\/\//.exec(process.env[k]);
  })[0];

  if (guessEnv) {
    return connectionParser(process.env[guessEnv]);
  }

  throw new Error('missing connection url, environment variable or init call to mongo-getdb');

};