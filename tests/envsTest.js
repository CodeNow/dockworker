var request = require('request');
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
          'flow': 'fresh'
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
        } else if (body.flow == null) {
          done(new Error());
        } else {
          done();
        }
      });
    });
  });
});