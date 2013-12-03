var rimraf = require('rimraf');
var fs = require('../shims/fs');
var path = require('path');

// walk through /run and remove all filecontents, keeping 1 level directories.
var root = '/run';
if (fs.existsSync(root)) {
  fs.readdirSync(root).forEach(cleanFileOrDir);
}

function cleanFileOrDir (f) {
  var fPath = path.join(root, f);

  if(fs.statSync(fPath).isFile()) {
    // if its a file delete it right away
    rimraf.sync(fPath);
  } else {
    // remove its contents
    rimrafKidsSync(fPath);
  }
}

// sync rm -rf p/*
function rimrafKidsSync (p) {
  fs.readdirSync(p).forEach(removeFile);
  function removeFile (f) {
    try {
      rimraf.sync(path.join(p, f));
    } catch (err) {
      console.error(err);
    }
  }
}

// mongodb
if (fs.existsSync('/data/db/mongod.lock')) {
	rimraf.sync('/data/db/mongod.lock');
}
