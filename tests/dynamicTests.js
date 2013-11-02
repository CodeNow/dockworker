var request = require('request');

describe('Dynamic', function (){
  it('should redirect', function (done) {
    request({
      url: 'http://localhost:15000/dynamic/tail'
    }, function (err, res, body) {
      done(err);
    });
  })
})