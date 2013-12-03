var request = require('request');
describe('Cmd', function () {
  describe('flow', function () {
    it('should be default', function (done) {
      request({
        url: 'http://localhost:15000/api/cmd',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.cmd !== 'npm') {
          done(new Error());
        } else {
          done();
        }
      });
    });
    it('should allow change', function (done) {
      request.post({
        url: 'http://localhost:15000/api/cmd',
        json: { cmd: 'node server.js' }
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
    it('should be changed', function (done) {
      request({
        url: 'http://localhost:15000/api/cmd',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.cmd !== 'node') {
          done(new Error());
        } else {
          done();
        }
      });
    });
  });
});