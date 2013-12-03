process.env.STOP_URL = 'http://localhost:15001/';
process.env.RUNNABLE_START_CMD = 'npm start';
process.env.RUNNABLE_USER_DIR = __dirname + '/fixtures';
process.env.RUNNABLE_SERVICE_CMDS = 'sleep 1000;sleep 1000';

describe('Autostop', function () {
  it('should stop on it\'s own', function (done) {
    var http = require('http');

    var server = http.createServer(function (req, res) {
      res.end('ok');
      server.close(done);
    }).listen(15001, function () {
      require('..');
    });
  });
});

