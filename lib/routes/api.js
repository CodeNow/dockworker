var express = require('express');
var middleware = require('../middleware');
var command = require('../models/command');
var webUpChecker = require('../controllers/webUpChecker');
var build = require('../models/build');
var exec = require('child_process').exec;
var app = module.exports = express();

app.get('/checkWebUp', function (req, res) {
  webUpChecker(req.domain.intercept(function () {
    res.send(200);
  }));
});
app.get('/servicesToken', function (req, res) {
  res.send(process.env.SERVICES_TOKEN);
});
app.get('/envs', function (req, res) {
  res.json(200, process.env);
});
app.post('/envs', middleware.json, function (req, res) {
  build.dirty = true;
  Object.keys(req.body).forEach(function (key) {
    if (key === 'RUNNABLE_START_CMD') {
      command.setStartCommand(req.body.RUNNABLE_START_CMD);
    }
    if (key === 'RUNNABLE_BUILD_CMD') {
      command.setBuildCommand(req.body.RUNNABLE_BUILD_CMD);
    }
    process.env[key] = req.body[key];
  });
  res.send(204);
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
  build.dirty = true;
  command.setBuildCommand(req.body);
  res.send(204);
});
app.get('/clean', function (req, res) {
  res.json(build.dirty);
});
app.post('/clean', function (req, res) {
  build.dirty = false;
  res.send(204);
});
app.get('/runcommand', function (req, res) {
  exec(req.query.command, function (err, stdout, stderr) {
    if (err) {
      console.log('ERR', err, req.query.command);
      res.send(500, err.message);
    } else if (stderr) {
      res.send(400, stderr);
    } else {
      res.send(200, stdout);
    }
  });
});