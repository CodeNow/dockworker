var request = require('request');
var async = require('async');
describe('Clean', function () {
  it('should be clean', function (done) {
    request({
      url: 'http://localhost:15000/api/clean',
      json: {}
    }, function (err, res, body) {
      if (err) {
        done(err);
      } else if (body !== false) {
        done(new Error());
      } else {
        done();
      }
    });
  });
  it('should dirty on change', function (done) {
    async.series([
      function (cb) {
        request.post({
          url: 'http://localhost:15000/api/buildCmd',
          json: 'npm run build'
        }, cb);
      },
      function (cb) {
        request({
          url: 'http://localhost:15000/api/clean',
          json: {}
        }, function (err, res, body) {
          if (err) {
            cb(err);
          } else if (body !== true) {
            cb(new Error());
          } else {
            cb();
          }
        });
      }
    ], done);
  });
  it('should allow clean up', function (done) {
    request.post({
      url: 'http://localhost:15000/api/clean',
      json: {}
    }, function (err, res, body) {
      if (err) {
        done(err);
      } else if (res.statusCode !== 204) {
        done(new Error());
      } else {
        done();
      }
    });
  });
  it('should be clean', function (done) {
    request({
      url: 'http://localhost:15000/api/clean',
      json: {}
    }, function (err, res, body) {
      if (err) {
        done(err);
      } else if (body !== false) {
        console.log(body);
        done(new Error());
      } else {
        done();
      }
    });
  });
});