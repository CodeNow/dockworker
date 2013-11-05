var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var tail = require('./tail');
var portscanner = require('portscanner')
var cmd = require('./command');
var buildCmd = require('./buildCommand');
var EventEmitter = require('events').EventEmitter;

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";

var options = {
  cwd: serviceSrcDir,
  detached: true,
  env: process.env
};

var app = module.exports = {
  start: restart,
  restart: restart,
  stop: stop,
  buildRunning: false,
  buildCode: null,
  child: null,
  checkWebUp: checkWebUp,
  dispatch: new EventEmitter()
};

function noop () {}

function restart (cb) {
  stop(start);
  function start (err) {
    if (err) {
      cb(err);
    }
    else if (buildCmd.cmd) {
      startBuild(cb);
    }
    else {
      startApp(cb);
    }
  }
}

function startBuild (cb) {
  app.buildRunning = true;
  app.child = spawn(buildCmd.cmd, buildCmd.args, options);
  app.dispatch.emit('attached:child', 'build');
  app.child.unref();
  app.child.on('error', onError);
  app.child.once('exit', onBuildExit);
  tail.reset();
  tail.write('# '+buildCmd.toString()+'\r\n');
  app.child.stdout.pipe(tail, {end: false});
  app.child.stderr.pipe(tail, {end: false});
  cb();
}

function onBuildExit (code, signal) {
  app.buildRunning = false;
  app.child = null;
  app.buildCode = code;
  if (code === 0) {
    startApp(noop);
  }
}

function startApp (cb) {
  app.child = spawn(cmd.cmd, cmd.args, options);
  app.dispatch.emit('attached:child', 'app');
  app.child.unref();
  app.child.on('error', onError);
  app.child.once('exit', onExit);
  tail.reset();
  var cmdStr = cmd.toString();
  if (cmdStr.toLowerCase() !== 'date') {
    tail.write('\r\n# '+cmd.toString()+'\r\n');
  }
  app.child.stdout.pipe(tail, {end: false});
  app.child.stderr.pipe(tail, {end: false});
  cb();
}

function onError (err) {
  console.error('child error', err);
  stop(noop);
}

function onExit (code, signal) {
  if (code) {
    var message = '\r\nProcess exited';
    if (code != null) {
      message += ' with code: ' + code;
    }
    if (signal != null) {
      message += ' due to signal: ' + signal;
    }
    message += '\r\n';
    tail.write(message);
  }
  app.buildRunning = false;
  app.child = null;
}

function stop (cb) {
  if (!app.child) {
    return process.nextTick(cb);
  }
  app.child.once('exit', wait);
  process.kill(-app.child.pid, 'SIGINT');
  process.kill(-app.child.pid);
  var fireTimeout = setTimeout(function withFire () {
    if (app.child) {
      process.kill(-app.child.pid, 'SIGKILL');
    }
  }, 1000);
  function wait () {
    clearTimeout(fireTimeout);
    setTimeout(cb, 10);
  }
}

function checkWebUp (cb) {
  var timedout = false;
  var webTimeout = setTimeout(function webTimedout () {
    timedout = true;
    cb(new Error('timed out'));
  }, 5000);
  (function checkListening () {
    portscanner.checkPortStatus(process.env.WEB_PORT || 80, 'localhost', checkStatus);
    function checkStatus (err, status) {
      if (timedout) {
        console.error('timed out');
      } else if (err) {
        clearTimeout(webTimeout);
        cb(err);
      } else if (status === 'closed') {
        setTimeout(checkListening, 50);
      } else {
        clearTimeout(webTimeout);
        cb();
      }
    }
  })();
}