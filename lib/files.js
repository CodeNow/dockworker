var async = require('async');
var concat = require('concat-stream');
var createDomain = require('domain').create;
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

module.exports.mount = function (app) {

  app.post('/api/files/create', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = path.normalize('/' + body.dir + body.path + '/' + body.name);
        fs.exists(filePath, function (exists) {
          if (exists) { res.json(403, { message: 'resource already exists' }); } else {
            fs.writeFile(filePath, body.content, 'utf8', function (err) {
              if (err && err.errno === 34) { res.json(403, { message: 'path does not exist' }); } else {
                if (err) { res.json(500, { message: 'error writing file volume' }); } else {
                  res.json(201, { });
                }
              }
            });
          }
        });
      }));
    });
  });

  app.post('/api/files/read', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = '/' + body.dir + body.path + '/' + body.name;
        fs.exists(filePath, function (exists) {
          if (!exists) { res.json(500, { message: 'volume out of sync with mongodb' }); } else {
            fs.readFile(filePath, 'utf8', function (err, content) {
              if (err) { res.json(500, { message: 'error reading project file from volume'}); } else {
                res.json(201, content);
              }
            });
          }
        });
      }));
    });
  });

  app.post('/api/files/update', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = '/' + body.dir + body.path + '/' + body.name;
        fs.exists(filePath, function (exists) {
          if (!exists) { res.json(500, { message: 'mongodb and volume out of sync'}); } else {
            fs.writeFile(filePath, content, 'utf8', function (err) {
              if (err && err.errno === 28) { res.json(403, { message: 'cannot update contents of a directory'}); } else {
                if (err) { res.json(500, { message: 'error writing file to volume'}); } else {
                  res.json(201, { });
                }
              }
            });
          }
        });
      }));
    });
  });

  app.post('/api/files/delete', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = '/' + body.dir + body.path + '/' + body.name;
        fs.exists(filePath, function (exists) {
          if (!exists) { res.json(500, { message: 'volume out of sync with mongodb'}); } else {
            fs.unlink(filePath, function (err) {
              if (err) { res.json(500, { message: 'error deleting project file from volume'}); } else {
                res.json(201, { });
              }
            });
          }
        });
      }));
    });
  });

  app.post('/api/files/rename', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = '/' + body.dir + body.path + '/' + body.name;
        var newFilePath = '/' + body.dir + body.path + '/' + body.newName;
        fs.exists(filePath, function (exists) {
          if (exists) { res.json(500, { message: 'mongodb and volume out of sync' }); } else {
            fs.exists(newFilePath, function (exists) {
              if (exists) { res.json(403, { message: 'destination resource already exists' }); } else {
                fs.rename(filePath, newFilePath, function (err) {
                  if (err) { res.json(500, { message: 'error writing file to volume' }); } else {
                    res.json(201, { });
                  }
                });
              }
            });
          }
        });
      }));
    });
  });

  app.post('/api/files/move', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = '/' + body.dir + body.path + '/' + body.name;
        var newFilePath = '/' + body.dir + body.newPath + '/' + body.name;
        fs.exists(filePath, function (exists) {
          if (!exists) { res.json(500, { message: 'mongodb and volume out of sync'}); } else {
            fs.exists(newFilePath, function (exists) {
              if (exists) { res.json(403, { message: 'destination resource already exists'}); } else {
                fs.rename(filePath, newFilePath, function (err) {
                  if (err && err.errno === 18) { res.json(403, { message: 'cannot move path into itself'}); } else {
                    if (err && err.errno === 34) { res.json(403, { message: 'destination does not exist'}); } else {
                      if (err && err.errno === 27) { res.json(403, { message: 'destination is not a directory'}); } else {
                        if (err) { res.json(500, { messsage: 'error writing file to volume'}); } else {
                          res.json(201, { });
                        }
                      }
                    }
                  }
                });
              }
            });
          }
        });
      }));
    });
  });

  app.post('/api/files/readall', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var files = [ ];
        var filePath = path.normalize('/' + body.dir);
        var ignores = body.ignores;
        var exts = body.exts;
        var read_directory = domain.bind(function (currPath, currVirtualPath, cb) {
          fs.readdir(currPath, domain.bind(function (err, diskFiles) {
            if (err) { cb({ code: 500, msg: 'error reading directory, are you root?'}); } else {
              async.forEach(diskFiles, domain.bind(function (file, cb) {
                var virtualFile = path.normalize(currVirtualPath + '/' + file);
                var diskFile = path.normalize(currPath + '/' + file);
                var ignored = false;
                if (/^\./.test(file)) {
                  ignored = true;
                } else {
                  ignores.forEach(function (ignore) {
                    if (ignore.indexOf(virtualFile) !== -1) {
                      ignored = true;
                    }
                  });
                }
                if (ignored) { cb(); } else {
                  fs.stat(diskFile, domain.bind(function (err, stats) {
                    if (err) { cb({ code: 500, msg: 'error getting file stats' }); } else {
                      if (stats.isDirectory()) {
                        files.push({
                          name: file,
                          path: currVirtualPath,
                          dir: true
                        })
                        read_directory(diskFile, virtualFile, cb);
                      } else {
                        var getContent = false;
                        var fileExt = path.extname(diskFile);
                        if (fileExt) { fileExt = fileExt.toLowerCase(); }
                        exts.forEach( function (ext) {
                          if (ext === fileExt) {
                            getContent = true;
                          }
                        });
                        if (getContent) {
                          fs.readFile(diskFile, 'utf8', domain.bind(function (err, content) {
                            if (err) { cb({ code: 500, msg: 'error reading file from disk' }); } else {
                              files.push({
                                name: file,
                                path: currVirtualPath,
                                dir: false,
                                content: content
                              });
                              cb();
                            }
                          }));
                        } else {
                          files.push({
                            name: file,
                            path: currVirtualPath,
                            dir: false
                          });
                          cb();
                        }
                      }
                    }
                  }));
                }
              }), domain.bind(function (err) {
                if (err) {
                  cb({ code: 500, msg: 'error reading files from container'});
                } else {
                  cb(null, files);
                }
              }));
            }
          }));
        });
        read_directory(filePath, '/', function (err, files) {
          if (err) { res.json(err.code, { message: err.msg }); } else {
            res.json(201, files);
          }
        });
      }));
    });
  });

  app.post('/api/files/mkdir', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = '/' + body.dir + body.path + '/' + body.name;
        fs.exists(filePath, function (exists) {
          if (exists) { res.json(403, { message: 'resource already exists'}); } else {
            fs.mkdir(filePath, function (err) {
              if (err && err.errno === 34) { res.json(403, {message: 'path does not exist'}); } else {
                if (err) { res.json(500, { message: 'error writing directory to volume' }); } else {
                  cb();
                }
              }
            });
          }
        });
      }));
    });
  });

  app.post('/api/files/readdir', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var files = [ ];
        var filePath = '/' + body.dir + '/' + body.sub;
        var exts = body.exts;
        var read_directory = domain.bind(function (currPath, currVirtualPath, cb) {
          fs.readdir(currPath, domain.bind(function (err, diskFiles) {
            if (err) {
              if(err.errno === 34) { cb({ code: 404, msg: 'path not found'}) } else {
                if (err.errno === 27) { cb({ code: 403, msg: 'resource is not a path'}) } else {
                  cb({ code: 500, msg: 'error reading directory, are you root?'});
                }
              }
            } else {
              async.forEach(diskFiles, domain.bind(function (file, cb) {
                var virtualFile = path(currVirtualPath + '/' + file);
                var diskFile = path.normalize(currPath + '/' + file);
                fs.stat(diskFile, domain.bind(function (err, stats) {
                  if (err) { cb({ code: 500, msg: 'error getting file stats' }); } else {
                    if (stats.isDirectory()) {
                      files.push({
                        name: file,
                        path: currVirtualPath,
                        dir: true
                      });
                      cb();
                    } else {
                      var getContent = false;
                      var fileExt = path.extname(diskFile);
                      if (fileExt) { fileExt = fileExt.toLowerCase(); }
                      exts.forEach( function (ext) {
                        if (ext === fileExt) {
                          getContent = true;
                        }
                      });
                      if (!getContent) {
                        files.push({
                          name: file,
                          path: currVirtualPath,
                          dir: false
                        });
                        cb();
                      } else {
                        fs.readFile(diskFile, 'utf8', domain.bind(function (err, content) {
                          if (err) { cb({ code: 500, msg: 'error reading file from disk' }); } else {
                            files.push({
                              name: file,
                              path: currVirtualPath,
                              dir: false,
                              content: content
                            });
                            cb();
                          }
                        }));
                      }
                    }
                  }
                }));
              }), domain.bind(function (err) {
                if (err) {
                  cb({ code: 500, msg: 'error reading files from container'});
                } else {
                  cb(null, files);
                }
              }));
            }
          }));
        });
        read_directory(filePath, subDir, function (err, files) {
          if (err) { res.json(err.code, { message: err.msg }); } else {
            res.json(201, files);
          }
        });
      }));
    });
  });

  app.post('/api/files/rmdir', function (req, res) {
    var domain = createDomain();
    domain.on('error', function (err) {
      res.json(500, { message: err.message });
    });
    domain.run(function () {
      req.pipe(concat(function (body) {
        var body = JSON.parse(body);
        var filePath = '/' + body.dir + body.path + '/' + body.name;
        fs.exists(filePath, function (exists) {
          if (!exists) { res.json(500, { message: 'volime out of sync with mongodb'}); } else {
            if (body.recursive) {
              rimraf(filePath, function (err) {
                if (err) { res.json(500, { message: 'error recursively removing project directory from volume'}); } else {
                  res.json(201, {});
                }
              });
            } else {
              fs.rmdir(filePath, function (err) {
                if (err && err.errno === 53) { res.json(403, { message: 'directory is not empty'}); } else {
                  if (err) { res.json(500, { message: 'error removing project directory from volume'}); } else {
                    res.json(201, {});
                  }
                }
              });
            }
          }
        });
      }));
    });
  });

}