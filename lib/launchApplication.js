var fs = require('./fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var Socket = require('net').Socket;

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";
var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
var startCmd = startCommandArray.shift();
var startArgs = startCommandArray;

var out = fs.openSync("/var/log/app.log", 'a' );
var err = fs.openSync("/var/log/app.log", 'a' );

var options = {
  cwd: serviceSrcDir,
  detached: true,
  stdio: [ 'ignore', out, err ],
  env: process.env
};

var app = module.exports = {
  start: restart,
  restart: restart,
  stop: stop,
  child: null
};

function noop () {}

function restart (cb) {
  stop(start);
  function start (err) {
    if (err) {
      cb(err);
    } else {
      app.child = spawn(startCmd, startArgs, options);
      app.child.unref();
      app.child.on('error', onError);
      app.child.once('exit', onExit);

      testConnection();
    }
  }

  function testConnection () {
    var failCount = 0;

    var socket = new Socket();

    socket.on('error', function (err) {
      if (err.code === 'ECONNREFUSED') {
        if(failCount++ < 50) {
          setTimeout(connect, 50);
        } else {
          cb();
        }
      } else {
        cb(err);
      }
    });
    connect();
    function connect () {
      socket.connect(8080, 'localhost', cb);
      // socket.connect(process.env.WEB_PORT || 80, 'localhost', cb);
    }
  }
}

function onError (err) {
  console.error('child error', err);
  stop(noop);
}

function onExit () {
  app.child = null;
}

function stop (cb) {
  if (!app.child) {
    return process.nextTick(cb);
  }
  app.child.once('exit', wait);
  process.kill(-app.child.pid);
  function wait () {
    setTimeout(cb, 10);
  }
}
