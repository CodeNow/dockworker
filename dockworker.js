#!/usr/bin/env node
var spawn = require('child_process').spawn;
var fs = require('fs');
var runnableStartCmd = process.env.RUNNABLE_START_CMD;
var cmd = runnableStartCmd.shift();
var args = runnableStartCmd;

var mongo = spawn('mongod');
var redis = spawn('redis-server');

var node = spawn(cmd, [args], { stdio: 'inherit' });