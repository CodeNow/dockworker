var buildCommand = require('./buildCommand');
var theApp = require('./launchApplication');
var express = require('express');

var app = module.exports = express();

app.get('/tail', function (req, res) {
  if (buildCommand.cmd && theApp.buildRunning) {
    res.redirect('/static/build.html');
  }
  else {
    res.redirect('/static/log.html');
  }
});