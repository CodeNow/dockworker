var request = require('request');
process.env.RUNNABLE_START_CMD = 'sleep 1000';
process.env.RUNNABLE_USER_DIR = '~';
process.env.RUNNABLE_SERVICE_CMDS = 'sleep 1000;sleep 1000';
require('..');
describe('Envs', function () {
  describe('flow', function () {
    it('should not be set', function (done) {
      request({
        url: 'http://localhost:15000/api/envs',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.flow != null) {
          console.log(body);
          done(new Error());
        } else {
          done();
        }
      });
    });
    it('should not error', function (done) {
      request.post({
        url: 'http://localhost:15000/api/envs',
        json: {
          key: 'flow',
          value: 'fresh'
        }
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });
    it('should be set', function (done) {
      request({
        url: 'http://localhost:15000/api/envs',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.flow === null) {
          done(new Error());
        } else {
          done();
        }
      });
    });
  });
});