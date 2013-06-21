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
  var log = fs.createWriteStream("/var/log/" + commandArray.join("_") + ".log");
  var binary = commandArray.shift();
  var binaryArgs = commandArray;
  var proc = spawn(binary, binaryArgs);
  proc.stdout.pipe(log);
  proc.stderr.pipe(log);
});

// Launch our App

var start = spawn(cmd, args, { cwd: serviceSrcDir });
start.stdout.pipe(process.stdout);
start.stderr.pipe(process.stderr);

var bash = spawn('bash', [], { stdio: 'inherit', cwd: serviceSrcDir});

// Debug only

console.log(serviceSrcDir);
console.log(cmd);
console.log(args);
console.log(runnableServiceCommands);
