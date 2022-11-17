const MongoClient     = require("mongodb").MongoClient;
const async           = require('async');
const configs = {};

const MemoizedConnect = async.memoize(function (alias, callback) {
  if (!(alias in configs)) {
    throw new Error('unknown ' + alias + ' config');
  }
  MongoClient.connect.apply(MongoClient, configs[alias].concat([callback]));
});

const isMongoUrl = (str) => str.indexOf('mongodb://') === 0 || str.indexOf('mongodb+srv://') === 0;

const getDb = module.exports = function(alias, callback) {
  if ( !(alias in configs) && typeof alias == 'string' && isMongoUrl(alias) ) {
    //directly using a connection string as alias.
    configs[alias] = [alias];
  }

  if (typeof alias === 'function') {
    callback = alias;
    alias = 'default';
  }

  const done = function (err, client) {
    let db;
    if(client && client.constructor == MongoClient) {
      db = client.db();
      db.client = client;
    } else {
      db = client;
    }
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

getDb.legacyHapi = require('./legacy-hapi')(getDb);
