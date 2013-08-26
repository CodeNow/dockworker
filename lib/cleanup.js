var rimraf = require("rimraf");
var fs = require("fs");
var walk    = require('walk');
var exec = require('child_process').exec,
child;

//clean all emphemeral directories
rimraf.sync("/tmp");
rimraf.sync("/var/log/app.log");

//recreate empty directories
fs.mkdirSync("/tmp");

// Below is the code clear all the files in the run directory
// while keeping the directories intact
var walker  = walk.walk('./run', { followLinks: false });

// delete all files
walker.on('file', function(root, stat, next) {
    rimraf.sync(root + '/' + stat.name);
    next();
});

// empty the directories
walker.on('directories', function(root, dirStatsArray, next) {
  child = exec('rm -rf ' + root + '/' + dirStatsArray[0].name + '/*',
    function (error, stdout, stderr) {
      // console.log('stdout: ' + stdout);
      // console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });
  next();
});

walker.on('end', function() {
    // console.log(files);
});

