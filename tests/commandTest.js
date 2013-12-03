var request = require('request');
describe('Cmd', function () {
  describe('start', function () {
    it('should be default', function (done) {
      request({
        url: 'http://localhost:15000/api/cmd',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body !== 'npm start') {
          done(new Error());
        } else {
          done();
        }
      });
    });
    it('should allow change', function (done) {
      request.post({
        url: 'http://localhost:15000/api/cmd',
        json: 'node server.js'
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
        } else if (body !== 'node server.js') {
          console.log(body);
          done(new Error());
        } else {
          done();
        }
      });
    });
  });
  describe('build', function () {
    it('should be default', function (done) {
      request({
        url: 'http://localhost:15000/api/buildCmd',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body !== 'npm run build') {
          done(new Error());
        } else {
          done();
        }
      });
    });
    it('should allow change', function (done) {
      request.post({
        url: 'http://localhost:15000/api/buildCmd',
        json: 'npm run lint'
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
        url: 'http://localhost:15000/api/buildCmd',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body !== 'npm run lint') {
          console.log(body);
          done(new Error());
        } else {
          done();
        }
      });
    });
  });
});