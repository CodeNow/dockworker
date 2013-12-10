var request = require('request');
describe('Clean', function () {
  it('should be dirty', function (done) {
    request({
      url: 'http://localhost:15000/api/clean',
      json: {}
    }, function (err, res, body) {
      if (err) {
        done(err);
      } else if (body !== true) {
        done(new Error());
      } else {
        done();
      }
    });
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