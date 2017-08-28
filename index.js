var MongoClient     = require("mongodb").MongoClient;
var async           = require('async');
var configs = {};

var MemoizedConnect = async.memoize(function (alias, callback) {
  if (!(alias in configs)) {
    throw new Error('unknown ' + alias + ' config');
  }
  MongoClient.connect.apply(MongoClient.connect, configs[alias].concat([callback]));
});


var getDb = module.exports = function(alias, callback) {
  //directly using a connection string as alias.
  if ( !(alias in configs) && typeof alias == 'string' && alias.indexOf('mongodb://') === 0 ) {
    configs[alias] = [alias];
  }

  if (typeof alias === 'function') {
    callback = alias;
    alias = 'default';
  }

  var done = function (err, db) {
    if (callback.length === 1) {
      if (err) {
        console.error('Error connecting to the db, exiting: \n', err);
        return process.exit(1);
      } else {
        return callback(db);
      }
    } else {
      callback(err, db);
    }
  };

  MemoizedConnect(alias, function (err, db) {
    if (err) {
      return done(err);
    }
    done(null, db);
  });
};

getDb.init = function () {
  var args = [].slice.call(arguments, 0);
  var alias = 'default';

  if (args.length === 0) {
    alias = 'default';
    args  = [process.env.DB];
  }

  if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string'){
    alias = args[0];
    args = args.slice(1);
  }

  delete MemoizedConnect.memo[alias];
  configs[alias] = args;
};

getDb.hapi = require('./hapi')(getDb);