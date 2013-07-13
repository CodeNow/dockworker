var fs = require('fs');
var spawn = require('child_process').spawn;
var express = require('express');
var webStreams = require('./webstreams');
var server = require('./server');

var app = express();

// Launch user App

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";
var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
var startCmd = startCommandArray.shift();
var startArgs = startCommandArray;

var applog = fs.createWriteStream("/var/log/app.log", { flags: 'a' });

var theApp = null;
var isAppRunning = false;

function startApp(cb) {
  console.log(startCmd, startArgs, serviceSrcDir);
  theApp = spawn(startCmd, startArgs, {
    cwd: serviceSrcDir,
    env: process.env
  });
  theApp.once('close', function (code, signal) {
    theApp = null;
    isAppRunning = false;
  });
  theApp.stdout.pipe(applog, { end: false });
  theApp.stderr.pipe(applog, { end: false });
  cb();
}

function stopApp(cb) {
  if (theApp) {
    theApp.once('close', function (code, signal) {
      theApp = null;
      cb();
    });
    theApp.kill();
  }
}

app.get('/api/start', function (req, res) {
	if (isAppRunning) {
    res.json(409, { message: 'application already started' });
  } else {
    startApp(function (err) {
      if (err) {
        res.json(500, { message: 'error starting application' });
      } else {
        isAppRunning = true;
        res.json(200, { message: 'application started successfully' });
      }
    });
  }
});

app.get('/api/stop', function (req, res) {
  if (!isAppRunning) {
    res.json(409, { message: 'application already stopped' });
  } else {
    stopApp(function (err) {
      if (err) {
        res.json(500, { message: 'error stopping application' });
      } else {
        isAppRunning = false;
        res.json(200, { message: 'application stopped successfully' });
      }
    });
  }
});

app.get('/api/running', function (req, res) {
  res.json(200, { running: isAppRunning });
});

app.get('/api/connection', function (req, res) {
  res.json(200, webStreams.connectionInfo());
});

server.on('request', function (req, res) {
  if (!res.finished) {
    app(req, res);
  }
});