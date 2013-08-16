var server = require('./server.js');
var ecstatic = require('ecstatic');
staticHandler = ecstatic({
  root: __dirname + '/../client',
  baseDir: '/static'
})

server.on('request', function (req, res) {
  if (/^\/static/.test(req.url)) {
    staticHandler(req, res);
  }
});