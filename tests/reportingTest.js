var request = require('request');
describe('Reporters', function () {
  describe('envs', function () {
    it('should return', function (done) {
      request({
        url: 'http://localhost:15000/api/envs',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });
  });
  describe('servicesToken', function () {
    it('should return', function (done) {
      request({
        url: 'http://localhost:15000/api/servicesToken',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });
  });
});