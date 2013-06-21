#!/usr/bin/env node

var spawn = require('child_process').spawn;
var fs = require('fs');
var runnableStartCmd = process.env.RUNNABLE_START_CMD;
var cmd = runnableStartCmd.shift();
var args = runnableStartCmd;
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS;

runnableServiceCommands.split(';').forEach(function (cmd) {
  spawn(cmd);
});

var node = spawn(cmd, [args], { stdio: 'inherit' });

/*
var bash = spawn('bash', [], {stdio: 'inherit' });
setInterval(function () {
  process.stdin.write('.');
}, 1000); 


var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(80);
console.log('Hello Kitty');
*/
