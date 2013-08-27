var rimraf = require("rimraf");
var fs = require("fs");
var walk    = require('walk');
var path = require('path');
var exec = require('child_process').exec,
child;


var doCleanUp = function (cb) {
  //clean logs
  rimraf.sync("/var/log/app.log");

  // Below is the code clear all the files in the run directory
  // while keeping the directories intact
  var walker  = walk.walk('/run', { followLinks: false });

  // delete all files
  walker.on('file', function(root, stat, next) {
    rimraf.sync(root + '/' + stat.name);
    next();
  });

  // empty the directories
  walker.on('directories', function(root, dirStatsArray, next) {
    rimrafKidsSync(root + '/' + dirStatsArray[0].name);
    next();
  });

  walker.on('end', function() {
    cb();
  });

  function rimrafKidsSync (p) {
    fs.readdirSync(p).forEach(function (f) {
      rimraf.sync(path.join(p, f));
    })
  }
}

module.exports.doCleanUp = doCleanUp;