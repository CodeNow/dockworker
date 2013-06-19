var Volumes, configs, fs, mkdirp, rimraf, wrench;

configs = require('../../configs');

fs = require('fs');

mkdirp = require('mkdirp');

rimraf = require('rimraf');

wrench = require('wrench');

Volumes = {
  create: function(id, cb) {
    var volumePath;
    volumePath = "" + configs.volumesPath + "/" + id;
    return fs.exists(volumePath, function(exists) {
      if (exists) {
        return cb({
          code: 500,
          msg: 'project volume already exists'
        });
      } else {
        return fs.mkdir(volumePath, function(err) {
          if (err) {
            return cb({
              code: 500,
              msg: 'error creating project volume'
            });
          } else {
            return cb();
          }
        });
      }
    });
  },
  remove: function(id, cb) {
    var volumePath;
    volumePath = "" + configs.volumesPath + "/" + id;
    return fs.exists(volumePath, function(exists) {
      if (!exists) {
        return cb({
          code: 500,
          msg: 'project volume does not exist'
        });
      } else {
        return rimraf(volumePath, function(err) {
          if (err) {
            return cb({
              code: 500,
              msg: 'error removing project volume'
            });
          } else {
            return cb();
          }
        });
      }
    });
  },
  copy: function(src, dst, cb) {
    var dstPath, srcPath;
    srcPath = "" + configs.volumesPath + "/" + src;
    dstPath = "" + configs.volumesPath + "/" + dst;
    return wrench.copyDirRecursive(srcPath, dstPath, function(err) {
      if (err) {
        return cb({
          code: 500,
          msg: 'error copying existing volume to new volume'
        });
      } else {
        return cb();
      }
    });
  },
  createFile: function(id, name, path, content, cb) {
    var filePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    return fs.exists(filePath, function(exists) {
      if (exists) {
        return cb({
          code: 403,
          msg: 'resource already exists'
        });
      } else {
        return fs.writeFile(filePath, content, 'utf8', function(err) {
          if (err && err.errno === 34) {
            return cb({
              code: 403,
              msg: 'path does not exist'
            });
          } else {
            if (err) {
              return cb({
                code: 500,
                msg: 'error writing file to volume'
              });
            } else {
              return cb();
            }
          }
        });
      }
    });
  },
  updateFile: function(id, name, path, content, cb) {
    var filePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    return fs.exists(filePath, function(exists) {
      if (!exists) {
        return cb({
          code: 500,
          msg: 'mongodb and volume out of sync'
        });
      } else {
        return fs.writeFile(filePath, content, 'utf8', function(err) {
          if (err && err.errno === 28) {
            return cb({
              code: 403,
              msg: 'cannot update contents of a directory'
            });
          } else {
            if (err) {
              return cb({
                code: 500,
                msg: 'error writing file to volume'
              });
            } else {
              return cb();
            }
          }
        });
      }
    });
  },
  renameFile: function(id, name, path, newName, cb) {
    var filePath, newFilePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    newFilePath = "" + configs.volumesPath + "/" + id + path + "/" + newName;
    return fs.exists(filePath, function(exists) {
      if (!exists) {
        return cb({
          code: 500,
          msg: 'mongodb and volume out of sync'
        });
      } else {
        return fs.exists(newFilePath, function(exists) {
          if (exists) {
            return cb({
              code: 403,
              msg: 'destination resource already exists'
            });
          } else {
            return fs.rename(filePath, newFilePath, function(err) {
              if (err) {
                return cb({
                  code: 500,
                  msg: 'error writing file to volume'
                });
              } else {
                return cb();
              }
            });
          }
        });
      }
    });
  },
  moveFile: function(id, name, path, newPath, cb) {
    var filePath, newFilePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    newFilePath = "" + configs.volumesPath + "/" + id + newPath + "/" + name;
    return fs.exists(filePath, function(exists) {
      if (!exists) {
        return cb({
          code: 500,
          msg: 'mongodb and volume out of sync'
        });
      } else {
        return fs.exists(newFilePath, function(exists) {
          if (exists) {
            return cb({
              code: 403,
              msg: 'destination resource already exists'
            });
          } else {
            return fs.rename(filePath, newFilePath, function(err) {
              if (err && err.errno === 18) {
                return cb({
                  code: 403,
                  msg: 'cannot move path into itself'
                });
              } else {
                if (err && err.errno === 34) {
                  return cb({
                    code: 403,
                    msg: 'destination does not exist'
                  });
                } else {
                  if (err && err.errno === 27) {
                    return cb({
                      code: 403,
                      msg: 'destination is not a directory'
                    });
                  } else {
                    if (err) {
                      return cb({
                        code: 500,
                        msg: 'error writing file to volume'
                      });
                    } else {
                      return cb();
                    }
                  }
                }
              }
            });
          }
        });
      }
    });
  },
  createDirectory: function(id, name, path, cb) {
    var filePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    return fs.exists(filePath, function(exists) {
      if (exists) {
        return cb({
          code: 403,
          msg: 'resource already exists'
        });
      } else {
        return fs.mkdir(filePath, function(err) {
          if (err && err.errno === 34) {
            return cb({
              code: 403,
              msg: 'path does not exist'
            });
          } else {
            if (err) {
              return cb({
                code: 500,
                msg: 'error writing directory to volume'
              });
            } else {
              return cb();
            }
          }
        });
      }
    });
  },
  readFile: function(id, name, path, cb) {
    var filePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    return fs.exists(filePath, function(exists) {
      if (!exists) {
        return cb({
          code: 500,
          msg: 'volume out of sync with mongodb'
        });
      } else {
        return fs.readFile(filePath, 'utf8', function(err, content) {
          if (err) {
            return cb({
              code: 500,
              msg: 'error reading project file from volume'
            });
          } else {
            return cb(null, content);
          }
        });
      }
    });
  },
  deleteFile: function(id, name, path, cb) {
    var filePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    return fs.exists(filePath, function(exists) {
      if (!exists) {
        return cb({
          code: 500,
          msg: 'volume out of sync with mongodb'
        });
      } else {
        return fs.unlink(filePath, function(err) {
          if (err) {
            return cb({
              code: 500,
              msg: 'error deleting project file from volume'
            });
          } else {
            return cb();
          }
        });
      }
    });
  },
  deleteAllFiles: function(id, cb) {
    var _this = this;
    return this.remove(id, function(err) {
      if (err) {
        return cb(err);
      } else {
        return _this.create(id, cb);
      }
    });
  },
  removeDirectory: function(id, name, path, recursive, cb) {
    var filePath;
    filePath = "" + configs.volumesPath + "/" + id + path + "/" + name;
    return fs.exists(filePath, function(exists) {
      if (!exists) {
        return cb({
          code: 500,
          msg: 'volume out of sync with mongodb'
        });
      } else {
        if (recursive) {
          return rimraf(filePath, function(err) {
            if (err) {
              return cb({
                code: 500,
                msg: 'error recursively removing project directory from volume'
              });
            } else {
              return cb();
            }
          });
        } else {
          return fs.rmdir(filePath, function(err) {
            if (err && err.errno === 53) {
              return cb({
                code: 403,
                msg: 'directory is not empty'
              });
            } else {
              if (err) {
                return cb({
                  code: 500,
                  msg: 'error removing project directory from volume'
                });
              } else {
                return cb();
              }
            }
          });
        }
      }
    });
  }
};

module.exports = Volumes;
