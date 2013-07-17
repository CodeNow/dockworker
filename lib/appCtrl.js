var fs = require('fs');
var SingleChild = require('single-child');
var express = require('express');
var webStreams = require('./webStreams');
var server = require('./server');
var createDomain = require('domain').create;

var app = express();

// Launch user App

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";
var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
var startCmd = startCommandArray.shift();
var startArgs = startCommandArray;

var applog = fs.createWriteStream("/var/log/app.log", { flags: 'a' });
applog.on('error', function (err) {
  console.error('applog error');
  console.error(err.stack);
});

var theApp = new SingleChild(startCmd, startArgs, {
  stdio: [
    'ignore',
    applog,
    applog
  ]
});

app.use(function (req, res, next) {
  var domain = createDomain();
  domain.on('error', next);
  domain.run(next);
  domain.add(req);
  domain.add(res);
});

app.get('/api/start', function (req, res) {
  theApp.start(req.domain.intercept(function () {
    res.json(200, { message: 'application started successfully' });
  }));
});

app.get('/api/stop', function (req, res) {
  theApp.stop(req.domain.intercept(function () {
    res.json(200, { message: 'application stopped successfully' });
  }));
});

app.get('/api/restart', function (req, res) {
  theApp.restart(req.domain.intercept(function () {
    res.json(200, { message: 'application restarted successfully' });
  }));
});

app.get('/api/running', function (req, res) {
  res.json(200, { 
    running: true,
    deprecated: true
  });
});

app.get('/api/connection', function (req, res) {
  res.json(200, webStreams.connectionInfo());
});

server.on('request', function (req, res) {
  if (/^\/api\//.test(req.url)) {
    app(req, res);
  }
});