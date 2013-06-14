#!/usr/bin/env node
var spawn = require('child_process').spawn;
var fs = require('fs');


var mongo = spawn('mongod');
var redis = spawn('redis-server');
var mysql = spawn('/usr/local/pgsql/bin/postgres');

var node = spawn('node', ['/root/hello.js'], { stdio: 'inherit' });