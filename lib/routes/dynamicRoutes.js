var buildCommand = require('../models/buildCommand');
var runCommand = require('../controllers/runCommand');
var express = require('express');

var app = module.exports = express();

app.get('/tail', function (req, res) {
  if (buildCommand.cmd && (runCommand.buildRunning || runCommand.buildCode !==0)) {
    res.redirect('/static/build.html');
  }
  else {
    res.redirect('/static/log.html');
  }
});