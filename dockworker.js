#!/usr/bin/env node

var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');
var shoe = require('shoe');
var pty = require('pty.js');
var dnode = require('dnode');
var MuxDemux = require('mux-demux');
var connectionCount = 0;
var lastConnect = Date.now();

// Locals

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/home";

// Launch Services
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS || "";

runnableServiceCommands.split(';').forEach(function (commandLine) {
  if (commandLine) {
    var commandArray = commandLine.trim().split(" ");
    var log = fs.createWriteStream("/var/log/" +
      commandArray.join("_").replace(/\//g, '_') +
      ".log", { flags: 'a' });
    var binary = commandArray.shift();
    var binaryArgs = commandArray;
    var proc = spawn(binary, binaryArgs);
    proc.stdout.pipe(log);
    proc.stderr.pipe(log);
  }
});

// Launch user App

var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
var startCmd = startCommandArray.shift();
var startArgs = startCommandArray;

var applog = fs.createWriteStream("/var/log/app.log", { flags: 'a' });

var theApp = null;
var isAppRunning = false;

function startApp(cb) {
  theApp = spawn(startCmd, startArgs, {
    cwd: serviceSrcDir,
    env: process.env
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

// tty

var server = http.createServer();

server.on("request", function(req, res) {

  if (req.url.toLowerCase()  == "/api/start") {
    if (isAppRunning) {
      res.writeHead('content-type', 'application/json');
      res.writeHead(409);
      res.end(JSON.stringify({ message: 'application alraedy started' }));
    } else {
      startApp(function (err) {
        if (err) {
          res.writeHead('content-type', 'application/json');
          res.writeHead(500);
          res.end(JSON.stringify({ message: 'error starting application' }));
        } else {
          isAppRunning = true;
          res.writeHead('content-type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'application started successfully' }));
        }
      });
    }
  } else if (req.url.toLowerCase()  == "/api/stop") {
    if (!isAppRunning) {
      res.writeHead('content-type', 'application/json');
      res.writeHead(409);
      res.end(JSON.stringify({ message: 'application already stopped' }));
    } else {
      stopApp(function (err) {
        if (err) {
          res.writeHead('content-type', 'application/json');
          res.writeHead(500);
          res.end(JSON.stringify({ message: 'error stopping application' }));
        } else {
          isAppRunning = false;
          res.writeHead('content-type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'application stopped successfully' }));
        }
      });
    }
  } else if (req.url.toLowerCase() == "/api/running") {
    res.writeHead('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ running: isAppRunning }));
  } else if (req.url.toLowerCase() == "/api/connection") {
    res.writeHead('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      connectionCount: connectionCount,
      lastConnect: lastConnect
    }));
  } else {
    res.writeHead(404);
    res.end();
  }

});

function disconnected () {
  connectionCount--;
  if (connectionCount === 0) {
    lastConnect = Date.now();
  }
}

var termsock = shoe(function (remote) {
  connectionCount++;
  var mx = MuxDemux();
  var ts = mx.createStream('pty');
  var ds = mx.createStream('dnode');

  var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: serviceSrcDir,
    env: process.env
  });
  term.pipe(ts).pipe(term);

  var d = dnode({
    resize: function (x, y) {
      term.resize(x, y);
    }
  });
  d.pipe(ds).pipe(d);

  remote.pipe(mx).pipe(remote);
  remote._destroy = remote.destroy;
  remote.destroy = function () {
    disconnected();
    remote._destroy();
  }
});

termsock.install(server, '/terminal');

var logsock = shoe(function (remote) {
  connectionCount++;
  var tail = spawn('tail', ['-f', '/var/log/app.log']);
  tail.stdout.pipe(remote, { end: false });
  remote._destroy = remote.destroy;
  remote.destroy = function () {
    disconnected();
    remote._destroy();
  }
});

logsock.install(server, '/log');

server.listen(15000);