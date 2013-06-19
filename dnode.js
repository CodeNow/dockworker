var Volumes, configs, d, dnode;

configs = require('../../configs');

dnode = require('dnode');

Volumes = {};

console.log('connecting to dnode');

d = dnode.connect(configs.dnode);

d.on('remote', function(remote) {
  console.log('connected to dnode');
  if (!remote.create) {
    throw new Error('volume does not implement create()');
  }
  if (!remote.remove) {
    throw new Error('volume does not implement remove()');
  }
  if (!remote.copy) {
    throw new Error('volume does not implement copy()');
  }
  if (!remote.createFile) {
    throw new Error('volume does not implement createFile()');
  }
  if (!remote.updateFile) {
    throw new Error('volume does not implement updateFile()');
  }
  if (!remote.renameFile) {
    throw new Error('volume does not implement renameFile()');
  }
  if (!remote.moveFile) {
    throw new Error('volume does not implement moveFile()');
  }
  if (!remote.createDirectory) {
    throw new Error('volume does not implement createDirectory()');
  }
  if (!remote.readFile) {
    throw new Error('volume does not implement readFile()');
  }
  if (!remote.deleteFile) {
    throw new Error('volume does not implement deleteFile()');
  }
  if (!remote.deleteAllFiles) {
    throw new Error('volume does not implement deleteAllFiles()');
  }
  if (!remote.removeDirectory) {
    throw new Error('volume does not implement removeDirectory()');
  }
  Volumes.create = remote.create;
  Volumes.remove = remote.remove;
  Volumes.copy = remote.copy;
  Volumes.createFile = remote.createFile;
  Volumes.updateFile = remote.updateFile;
  Volumes.renameFile = remote.renameFile;
  Volumes.moveFile = remote.moveFile;
  Volumes.createDirectory = remote.createDirectory;
  Volumes.readFile = remote.readFile;
  Volumes.deleteFile = remote.deleteFile;
  Volumes.deleteAllFiles = remote.deleteAllFiles;
  return Volumes.removeDirectory = remote.removeDirectory;
});

d.on('error', function(err) {
  return console.log(err);
});

module.exports = Volumes;
