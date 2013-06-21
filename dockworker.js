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
  var log = fs.createWriteStream("/var/log/" + commandArray.join("_") + ".log", { flags: 'a' });
  var binary = commandArray.shift();
  var binaryArgs = commandArray;
  console.log(binary);
  console.log(binaryArgs);
  var proc = spawn(binary, binaryArgs, { stdio: [null, log, log] });
});

// Debug only

console.log(serviceSrcDir);
console.log(cmd);
console.log(args);


// Launch our App
var applog = fs.createWriteStream("/var/log/app.log", { flags: 'a' });
var start = spawn(cmd, args, { stdio: [null, applog, applog], cwd: serviceSrcDir });

var bash = spawn('bash', [], { stdio: 'inherit', cwd: serviceSrcDir});


