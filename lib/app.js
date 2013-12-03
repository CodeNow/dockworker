var express = require('express');
var server = require('./server');
var middleware = require('./middleware');
var apiRoute = /^\/api\//;
var staticRoute = /^\/static\//;
var app = express();
require('./routes/streams');

app.use(middleware.domain);
if (process.env.NODE_ENV !== 'testing') {
  app.use(express.logger());
}
app.use(express.favicon());
app.use(express.limit('10mb'));
// use https://github.com/ForbesLindesay/browserify-middleware
app.use('/static', express.compress({ threshold: '100kb' }));
app.use('/static', express.static(__dirname + '/../public'));
app.use('/static', express.directory(__dirname + '/../public'));
app.use('/api', require('./routes/api'));
app.use('/api/files', require('./routes/files'));
app.use(middleware.error);
server.on('request', onRequest);

function onRequest(req, res) {
  if (apiRoute.test(req.url) || staticRoute.test(req.url)) {
    app(req, res);
  }
}