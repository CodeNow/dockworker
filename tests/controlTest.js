var request = require('request');
process.env.RUNNABLE_START_CMD = 'node server.js'; 
process.env.RUNNABLE_USER_DIR = __dirname + '/fixtures'; 
process.env.RUNNABLE_SERVICE_CMDS = 'sleep 1000;sleep 1000';
require('..');

describe('Control', function (){
  describe('start', function (){
    it('should not already be running', function (done){
      request({
        url: 'http://localhost:15000/api/running',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.running === true) {
          done(new Error('already running'));
        } else {
          done();
        }
      });
    })
    it('should not error out', function (done){
      request({
        url: 'http://localhost:15000/api/start',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (res.statusCode === 500) {
          done(new Error(body.message));
        } else {
          done();
        }
      });
    })
    it('should be running', function (done){
      request({
        url: 'http://localhost:15000/api/running',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.running !== true) {
          done(new Error('not running'));
        } else {
          done();
        }
      });
    })
    it('should say hello', function (done) {
      setTimeout(function () {
        request({
          url: 'http://localhost:8080',
          json: {}
        }, function (err, res, body) {
          if (err) {
            done(err);
          } else if (body !== 'hello') {
            done(new Error('rude'));
          } else {
            done();
          }
        });
      }, 100);
    })
  })
  describe('restart', function (){
    it('should not error out', function (done){
      request({
        url: 'http://localhost:15000/api/restart',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (res.statusCode === 500) {
          done(new Error(body.message));
        } else {
          done();
        }
      });
    })
    it('should be running', function (done){
      request({
        url: 'http://localhost:15000/api/running',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.running !== true) {
          done(new Error('not running'));
        } else {
          done();
        }
      });
    })
    it('should say hello', function (done){
      setTimeout(function () {
        request({
          url: 'http://localhost:8080',
          json: {}
        }, function (err, res, body) {
          if (err) {
            done(err);
          } else if (body !== 'hello') {
            done(new Error('rude'));
          } else {
            done();
          }
        });
      }, 100);
    })
  })
  describe('stop', function (){
    it('should be running', function (done){
      request({
        url: 'http://localhost:15000/api/running',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.running !== true) {
          done(new Error('not running'));
        } else {
          done();
        }
      });
    })
    it('should not error out', function (done){
      request({
        url: 'http://localhost:15000/api/stop',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (res.statusCode === 500) {
          done(new Error(body.message));
        } else {
          done();
        }
      });
    })
    it('should be stopped', function (done){
      request({
        url: 'http://localhost:15000/api/running',
        json: {}
      }, function (err, res, body) {
        if (err) {
          done(err);
        } else if (body.running === true) {
          done(new Error('still running'));
        } else {
          done();
        }
      });
    })
    it('should not say hello', function (done){
      setTimeout(function () {
        request({
          url: 'http://localhost:8080',
          json: {}
        }, function (err, res, body) {
          if (err) {
            done();
          } else {
            done(new Error('should not have been running'));
          }
        });
      }, 100);
    })
  })
})