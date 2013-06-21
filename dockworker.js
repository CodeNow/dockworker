#!/usr/bin/env node
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');
var shoe = require('shoe');
var pty = require('pty.js');

// Locals

var serviceSrcDir = process.env.RUNNABLE_USER_DIR;
var serviceLauncher = process.env.RUNNABLE_START_CMD.split(" ");
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS;
var cmd = serviceLauncher.shift();
var args = serviceLauncher;

// Launch Services
console.log({
  runnableServiceCommands: runnableServiceCommands,
  runnableServiceCommandsSplit: runnableServiceCommands.split(';'),
  binarys: runnableServiceCommands.split(';').map(function (commandLine) {
    if (commandLine) {
      var commandArray = commandLine.split(" ");
      var log = "/var/log/" + commandArray.join("_") + ".log";
      var binary = commandArray.shift();
      var binaryArgs = commandArray;
      return {
        commandArray: commandArray,
        binary: binary,
        binaryArgs: binaryArgs,
        log: log
      };
    } else {
      return null;
    }
  })
});
runnableServiceCommands.split(';').forEach(function (commandLine) {
  if (commandLine) {
    var commandArray = commandLine.split(" ");
    var log = fs.createWriteStream("/var/log/" + commandArray.join("_") + ".log", { flags: 'a' });
    var binary = commandArray.shift();
    var binaryArgs = commandArray;
    var proc = spawn(binary, binaryArgs);
    proc.stdout.pipe(log);
    proc.stderr.pipe(log);
  }
});

// Debug only

console.log(serviceSrcDir);
console.log(cmd);
console.log(args);


// Launch our App
var applog = fs.createWriteStream("/var/log/app.log", { flags: 'a' });
var start = spawn(cmd, args, { cwd: serviceSrcDir });
start.stdout.pipe(applog);
start.stderr.pipe(applog);

var bash = spawn('bash', [], { stdio: 'inherit', cwd: serviceSrcDir});

// tty
var server = http.createServer();
server.on('error', function (error) {
  console.error(error);
});

var sock = shoe(function (remote) {
  var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: serviceSrcDir,
    env: process.env
  });
  remote.pipe(term).pipe(remote);
});

sock.install(server, '/terminal');
server.listen(15000);

