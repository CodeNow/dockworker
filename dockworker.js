#!/usr/bin/env node
var spawn = require('child_process').spawn;
var fs = require('fs');

// Locals

var serviceSrcDir = process.env.RUNNABLE_USER_DIR;
var serviceLauncher = process.env.RUNNABLE_START_CMD.split(" ");
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS;
var cmd = serviceLauncher.shift();
var args = serviceLauncher;

// Launch Services

runnableServiceCommands.split(';').forEach(function (commandLine) {
  var commandArray = commandLine.split(" ");
  var stream = fs.createWriteStream("/var/log/" + commandArray.join("_") + ".log");
  var binary = commandArray.shift();
  var binaryArgs = commandAray;
  spawn(binary, [binaryArgs], function (proc) {
    proc.stdout.pipe(stream);
    proc.stderr.pipe(stream);
  });
});

// Launch our App

var node = spawn(cmd, [args], { stdio: 'inherit', cwd: serviceSrcDir});

// Debug only

console.log(serviceSrcDir);
console.log(cmd);
console.log(args);
console.log(runnableServiceCommands);
