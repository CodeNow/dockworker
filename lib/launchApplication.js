var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";
var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
var startCmd = startCommandArray.shift();
var startArgs = startCommandArray;
var options = {
  cwd: serviceSrcDir,
  detached: true,
  stdio: [ 'ignore', out, err ],
  env: process.env
};
var child = null;

var out = fs.openSync("/var/log/app.log", 'a' );
var err = fs.openSync("/var/log/app.log", 'a' );

module.exports = {
  start: function (cb) {
    this.restart.apply(this, arguments);
  },
  restart: function (cb) {
    this.stop(function (err) {
      if (err) {
        return cb(err);
      }
      child = spawn(startCmd, startArgs, options);
      child.unref();

      child.on('error', function (err) {
        console.error('child error', err);
      });

      child.on('exit', function () {
        child = null;
      });

      if (cb) {
        cb();
      }
    });
  },
  stop: function (cb) {
    if (!child) {
      if (cb) {
        process.nextTick(cb);
      }
      return;
    }

    exec('/bin/kill -TERM -- -' + child.pid, function (err) {
      if (err) {
        cb(err);
      } else {
        cb();
      }
      child = null;
    });
  }
};

