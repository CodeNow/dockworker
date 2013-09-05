var createDomain = require('domain').create;
var concat = require('concat-stream');
var path = require('path');
var fs = require('fs');

module.exports.domain = function domainMiddleware (req, res, next) {
  var domain = createDomain();
  domain.add(req);
  domain.add(res);
  domain.on('error', next);
  domain.run(next);
};

module.exports.error = function errorMiddleware (err, req, res, next) {
  res.json(500, { message: err.message, stack: err.stack });
};

module.exports.cors = function corsMiddleware (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
};

module.exports.json = function jsonMiddleware (req, res, next) {
  req.pipe(concat(concatted));

  function concatted (body) {
    req.body = JSON.parse(body);
    next();
  }
};

module.exports.filePath = function filePathMiddleare (req, res, next) {
  req.filePath = path.join('/', req.body.dir, req.body.path, '/', req.body.name);
  next();
};

module.exports.newFilePath = function newFilePathMiddleare (req, res, next) {
  req.newFilePath = path.join('/', req.body.dir, req.body.path, '/', req.body.newName);
  next();
};

module.exports.fileAbsent = function fileAbsentMiddleware (res, res, next) {
  fs.exists(req.filePath, checkExistance);

  function checkExistance (exists) {
    if (exists) { 
      res.json(403, { message: 'resource already exists' }); 
    } else {
      next();
    }
  }
};

module.exports.fileExists = function fileExistsMiddleware (res, res, next) {
  fs.exists(req.filePath, checkExistance);

  function checkExistance (exists) {
    if (!exists) { 
      res.json(403, { message: 'resource does not exists' }); 
    } else {
      next();
    }
  }
};

module.exports.newFileAbsent = function newFileAbsentMiddleware (res, res, next) {
  fs.exists(req.newFilePath, checkExistance);

  function checkExistance (exists) {
    if (exists) { 
      res.json(403, { message: 'destination resource already exists' }); 
    } else {
      next();
    }
  }
};
