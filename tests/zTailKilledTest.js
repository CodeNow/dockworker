if (process.platform !== 'darwin') {
  describe('processes', function () {
    it('tail should be dead', function (done) {
      var exec = require('child_process').exec;
      exec('ps | grep tail | grep -v grep | wc -l',
        function (error, stdout, stderr) {
        if ((stdout.trim().indexOf('0') === 0)) {
          done();
        } else {
          // tail did not die. Print all the info
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
          done(new Error('tail still alive'));
        }
      });
    });
    it('no extra processes should be running', function (done) {
      var exec = require('child_process').exec;
      exec('ps -O "ppid" | grep -v grep | grep ' + process.pid + " | wc -l",
        function (error, stdout, stderr) {
        if (parseInt(stdout) <= 2) {
          done();
        } else {
          // there is something going one
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
          done(new Error('child process still alive'));
        }
      });
    });
  });
}