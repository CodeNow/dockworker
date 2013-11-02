var buildCommand = require('./buildCommand');
var app = require('./launchApplication');
var express = require('express');

var app = module.exports = express();

app.get('/tail', function (req, res) {
  if (!buildCommand.cmd || !app.buildRunning) {
    res.redirect('/static/tail.html');
  }
  else {
    res.redirect('/static/build.html');
  }
});