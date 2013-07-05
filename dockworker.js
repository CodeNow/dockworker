#!/usr/bin/env node

var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');
var shoe = require('shoe');
var pty = require('pty.js');
var isAppRunning = false;

// Locals

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/home";

// Launch Services
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS || "";

runnableServiceCommands.split(';').forEach(function (commandLine) {
  if (commandLine) {
    var commandArray = commandLine.trim().split(" ");
    var log = fs.createWriteStream("/var/log/" + 
      commandArray.join("_").replace('/', '_') + 
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

var start;
function startApp() {
  isAppRunning = true;
  start = spawn(startCmd, startArgs, { cwd: serviceSrcDir });
  start.on("exit", function() {
    isAppRunning = false;
  });
  start.stdout.pipe(applog, { end: false });
  start.stderr.pipe(applog, { end: false });
}
startApp();

// tty

var server = http.createServer();

server.on("request", function(req, res) {
  if (req.url.toLowerCase()  == "/api/restart") {
    if (isAppRunning) {
      start.kill();
      start.once("exit", function() {
        startApp();
      });
    } else {
      startApp();
    }
  }
});

var termsock = shoe(function (remote) {
  var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: serviceSrcDir,
    env: process.env
  });
  remote.pipe(term).pipe(remote);
});

termsock.install(server, '/terminal');

var logsock = shoe(function (remote) {
  var tail = spawn('tail', ['-f', '/var/log/app.log']);
  tail.stdout.pipe(remote, { end: false });
});

logsock.install(server, '/log');

server.listen(15000);

