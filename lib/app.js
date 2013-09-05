var express = require('express');
var server = require('./server');
var middleware = require('./middleware');
var apiRoute = /^\/api\//;
var staticRoute = /^\/static\//;

var app = express();

app.use(middleware.domain);
app.use('/static', express.static(__dirname + '/../client'));
app.use('/static', express.directory(__dirname + '/../client'));
app.use('/api', require('./control'));
app.use('/api/files', require('./files'));
app.use(middleware.error);

server.on('request', onRequest);

function onRequest (req, res) {
  if (apiRoute.test(req.url) || staticRoute.test(req.url)) {
    app(req, res);
  }
}