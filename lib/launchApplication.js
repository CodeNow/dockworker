var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var tail = require('./tail');

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";
var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
var startCmd = startCommandArray.shift();
var startArgs = startCommandArray;

var options = {
  cwd: serviceSrcDir,
  detached: true,
  env: process.env
};

var app = module.exports = {
  start: restart,
  restart: restart,
  stop: stop,
  child: null,
  checkWebUp: checkWebUp
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
      app.child.stdout.pipe(tail, {end: false});
      app.child.stderr.pipe(tail, {end: false});
      cb();
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

function checkWebUp (cb) {
  var delay = 50; //ms
  var failCount = 0;
  var failTime = 5000; //ms
  var maxFailCount = failTime/delay;
  var port = process.env.WEB_PORT || 80;


  (function checkListening () {
    exec('netstat -tulpn | grep :' + port, function (err, stdout) {
      if (err) {
        cb(err);
      } else if (failCount >= maxFailCount) {
        cb(new Error('checkWebUp failed max wait ' + failTime + 'ms'));
      } else if (stdout.toString().trim().length !== 0) {
        // command found a process listening on port
        cb();
      } else {
        // process is not listening yet
        failCount++;
        setTimeout(checkListening, delay);
      }
    });
  })();
}