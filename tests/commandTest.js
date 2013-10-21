var request = require('request');
process.env.RUNNABLE_START_CMD = 'npm start'; 
process.env.RUNNABLE_USER_DIR = __dirname + '/fixtures'; 
process.env.RUNNABLE_SERVICE_CMDS = 'sleep 1000;sleep 1000';
require('..');

describe('Cmd', function (){
  describe('flow', function () {
    it('should be default', function (done) {
      request({
        url: 'http://localhost:15000/api/cmd',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.cmd !== 'npm') {
          done(new Error('bad result'));
        } else {
          done();
        }
      });
    })
    it('should allow change', function (done) {
      request.post({
        url: 'http://localhost:15000/api/cmd',
        json: {
          cmd: 'node',
          args: ['server.js']
        }
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (res.statusCode !== 204) {
          done(new Error('bad result'));
        } else {
          done();
        }
      });
    })
    it('should be changed', function (done) {
      request({
        url: 'http://localhost:15000/api/cmd',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.cmd !== 'node') {
          done(new Error('bad result'));
        } else {
          done();
        }
      });
    })
  })
})