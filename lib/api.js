var express = require('express');
var middleware = require('./middleware');
var runCommand = require('./runCommand.js');
var cmd = require('./command');
var buildCmd = require('./buildCommand');

var app = module.exports = express();

app.get('/start', controlApp('start'));

app.get('/stop', controlApp('stop'));

app.get('/restart', controlApp('restart'));

app.get('/running', middleware.cors, function (req, res) {
  res.json(200, { running: !!runCommand.child});
});

app.get('/checkWebUp', controlApp('checkWebUp'));

app.get('/servicesToken', function (req, res) {
  res.send(process.env.SERVICES_TOKEN);
});

app.get('/envs', function (req, res) {
  res.json(200, process.env);
});

app.post('/envs', middleware.json, function (req, res) {
  if (typeof req.body.key === 'string' && req.body.key.length) {
    if (typeof req.body.value === 'string') {
      process.env[req.body.key] = req.body.value;
      res.send(204);
    } else {
      delete process.env[req.body.key];
      res.send(204);
    }
  } else {
    res.send(406, 'bad key');
  }
});

function controlApp (method) {
  return appController;
  function appController (req, res) {
    runCommand[method](req.domain.intercept(done));
    function done () {
      res.json(200, { message: 'application ' + method + 'ed successfully' });
    }
  }
}

app.get('/cmd', function (req, res) {
  res.json(200, cmd);
});

app.post('/cmd', middleware.json, function (req, res) {
  cmd.set(req.body.cmd)
  res.send(204);
});

app.get('/buildCmd', function (req, res) {
  res.json(200, buildCmd);
});

app.post('/buildCmd', middleware.json, function (req, res) {
  buildCmd.set(req.body.cmd)
  res.send(204);
});