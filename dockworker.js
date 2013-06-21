#!/usr/bin/env node
var spawn = require('child_process').spawn;

var serviceSrcDir = process.env.RUNNABLE_USER_DIR;
var serviceLauncher = process.env.RUNNABLE_START_CMD.split(" ");
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS;
var cmd = serviceLauncher.shift();
var args = serviceLauncher;

// Launch Services

runnableServiceCommands.split(';').forEach(function (commandLine) {
  var commandArray = commandLine.split(" ");
  var binary = commandArray.shift();
  var binaryArgs = commandAray;
  spawn(binary, [binaryArgs]);
});

// Launch our App

var node = spawn(cmd, [args], { stdio: 'inherit', cwd: serviceSrcDir});

// Debug only

console.log(serviceSrcDir);
console.log(cmd);
console.log(args);
console.log(runnableServiceCommands);
