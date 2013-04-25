var mongodb          = require("mongodb");
var Server           = mongodb.Server;
var ReplSetServers   = mongodb.ReplSetServers;
var Db               = mongodb.Db;
var cache            = {};
var connectionLookup = require('./lib/connection-lookup');

function createServer ( hostPort ) {
  return new Server ( hostPort.host, hostPort.port, {
    auto_reconnect: true,
    socketOptions: { keepAlive: 300 },
    poolSize: 10
  });
}

function getOrCreate (alias) {
  alias = alias || 'default';

  if (cache[alias]) {
    return cache[alias].db;
  }

  cache[alias] = {waiting: []};

  var connectionSettings = connectionLookup.get(alias);
  
  var mongoserver;

  if (connectionSettings.replicants) {
    mongoserver = new ReplSetServers(connectionSettings.replicants.map(createServer), {
      rs_name:       connectionSettings.rs_name,
      socketOptions: {
        keepAlive: 300
      }
    });
  } else {
    mongoserver = createServer(connectionSettings);
  }


  var db = (cache[alias].db = new Db(connectionSettings.name, mongoserver, {safe:true}));

  return db;
}


function connected(alias){
  var waiting = cache[alias].waiting;
  waiting.forEach(function(cb) { 
    cb(cache[alias].db); 
  });
  delete cache[alias].waiting;
}

module.exports = function(alias, callback){
  if (!alias) {
    callback = function(){};
    alias = 'default';
  }
  if (typeof alias === 'function') {
    callback = alias;
    alias = 'default';
  }
  
  var db = getOrCreate(alias);

  if(!db.serverConfig.isConnected()){

    cache[alias].waiting.push(callback);
  
  }else{

    process.nextTick(function(){
      return callback(db);
    });

    return db;
  }

  if(!db.openCalled){
    db.open(function(err, db){
      if ( err ) {
        console.error('error connecting to the db, exiting');
        return process.exit(1);
      }
    
      var connectionSettings = connectionLookup.get(alias);
      if(connectionSettings.user && connectionSettings.password){
        db.authenticate(connectionSettings.user, connectionSettings.password, function(err){
          if(err){
            console.error('authentication error connecting to mongodb, exiting');
            return process.exit(2);
          }
          connected(alias);
        });
      }else{
        connected(alias);
      }
    });

    return db;
  }
};

module.exports.init = function (options) {
  cache={};
  connectionLookup.init(options.url);
};
