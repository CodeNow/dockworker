var request = require('request');
describe('Run Command', function () {
  it('should echo', function (done) {
    request({
      url: 'http://localhost:15000/api/runcommand',
      qs: {
        command: 'echo foo'
      }
    }, function (err, res, body) {
      if (err) {
        done(err);
      } else if (res.statusCode !== 200 || body !== 'foo\n') {
        done(new Error('did not echo'));
      } else {
        done();
      }
    });
  });
});