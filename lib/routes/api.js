var express = require('express');
var middleware = require('../middleware');
var command = require('../models/command');
var app = module.exports = express();

//app.get('/checkWebUp', controlApp('checkWebUp'));
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
app.get('/cmd', function (req, res) {
  res.json(200, command.getStartCommand());
});
app.post('/cmd', middleware.json, function (req, res) {
  command.setStartCommand(req.body);
  res.send(204);
});
app.get('/buildCmd', function (req, res) {
  res.json(200, command.getBuildCommand());
});
app.post('/buildCmd', middleware.json, function (req, res) {
  command.setBuildCommand(req.body);
  res.send(204);
});