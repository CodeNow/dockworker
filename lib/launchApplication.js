var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";
var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
var startCmd = startCommandArray.shift();
var startArgs = startCommandArray;

var child = null;

var out = fs.openSync("/var/log/app.log", 'a' );
var err = fs.openSync("/var/log/app.log", 'a' );

var options = {
  cwd: serviceSrcDir,
  detached: true,
  stdio: [ 'ignore', out, err ],
  env: process.env
};

module.exports = {
  start: restart,
  restart: restart,
  stop: stop
};

function noop () {}

function restart (cb) {
  stop(start);
  function start (err) {
    if (err) {
      cb(err);
    }
    child = spawn(startCmd, startArgs, options);
    child.unref();
    child.on('error', onError);
    child.on('exit', onExit);
    cb();
  }
}

function onError (err) {
  console.error('child error', err);
  stop(noop);
}

function onExit () {
  child = null;
}

function stop (cb) {
  if (!child) {
    return process.nextTick(cb);
  }
  exec('/bin/kill -TERM -- -' + child.pid, stopped);

  function stopped (err) {
    if (err) {
      cb(err);
    } else {
      cb();
    }
    child = null;
  }
}

  

