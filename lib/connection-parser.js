var url = require('url');

module.exports = function (dbString) {
  var parsedUrl  = url.parse(dbString);
  
  var result = {
    name:     parsedUrl.pathname.substr(1),
    user:     parsedUrl.auth ? parsedUrl.auth.split(':')[0] : null,
    password: parsedUrl.auth ? parsedUrl.auth.split(':')[1] : null
  };

  if (parsedUrl.host[0] === '[') {
    result.rs_name = parsedUrl.hostname.split('=')[0];

    result.replicants = parsedUrl.hostname.split('=')[1]
          .split(',')
          .map(function (serverPort) {
            var sp = serverPort.split(':');
            return {
              host: sp[0],
              port: parseInt(sp[1] || '27017', 10)
            };
          });
  } else {
    result.host = parsedUrl.hostname;
    result.port = parseInt(parsedUrl.port || '27017', 10);
  }

  return result;
};