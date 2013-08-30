var express = require('express');
var server = require('./server');
var middleware = require('./middleware');
var app = express();
var apiRoute = /^\/api\//;

app.use(middleware.domain);
app.use('/api', require('./control'));
app.use('/api/files', require('./files'));
app.use(middleware.error);

server.on('request', onRequest);

function onRequest (req, res) {
  if (apiRoute.test(req.url)) {
    app(req, res);
  }
}