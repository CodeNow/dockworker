var rimraf = require("rimraf");
var fs = require("fs");
var path = require('path');

// remove logs
rimraf.sync("/var/log/app.log");

// walk through /run and remove all filecontents, keeping 1 level directories.
var root = '/run';
if (fs.existsSync(root)) {
  fs.readdirSync(root).forEach(function (f) {
    var fPath = path.join(root, f);

    if(fs.statSync(fPath).isFile()) {
      // if its a file delete it right away
      rimraf.sync(fPath);
    } else {
      // remove its contents
      rimrafKidsSync(fPath);
    }
  });
}

// sync rm -rf p/*
function rimrafKidsSync (p) {
  fs.readdirSync(p).forEach(function (f) {
    rimraf.sync(path.join(p, f));
  });
}
