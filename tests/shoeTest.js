var ShoeClient = require('../lib/ShoeClient');
var MuxDemux = require('mux-demux');
var request = require('request');

describe('Streams', function () {
  describe('terminal', function () {
    it('should run echo', function (done) {
      var stream = new ShoeClient('ws://localhost:15000/streams/terminal');
      var muxDemux = new MuxDemux(onStream);
      stream.pipe(muxDemux).pipe(stream);
      function onStream(stream) {
        if (stream.meta === 'terminal') {
          onTerminal(stream);
        }
      }
      function onTerminal(stream) {
        stream.on('data', function (data) {
          if (/npm start/.test(data)) {
            done();
          }
        });
        stream.write('echo $RUNNABLE_START_CMD\n');
      }
    });
    it('should run another terminal with long running process', function (done) {
      var count = 0;
      var stream = new ShoeClient('ws://localhost:15000/streams/terminal');
      var muxDemux = new MuxDemux(onStream);
      stream.pipe(muxDemux).pipe(stream);
      function onStream(stream) {
        if (stream.meta === 'terminal') {
          onTerminal(stream);
        }
      }
      function onTerminal(stream) {
        stream.write("sleep 10&");
        done();
      }
    });
    if (process.platform !== 'darwin') {
      it('should only have 1 tail process', function (done) {
        var exec = require('child_process').exec;
        exec('ps -e -o command | grep -v grep | grep tail | wc -l',
          function (error, stdout, stderr) {
          console.log("stdout"+stdout);
          if (parseInt(stdout) === 1) {
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
    }
    it('should have web down', function (done) {
      request('http://localhost:15000/api/checkWebUp', function (err, res, body) {
        if (err) {
          done(err);
        } else if (res.statusCode !== 500) {
          done(new Error());
        } else {
          done();
        }
      });
    });
  });
  describe('logs', function () {
    before(function () {
      this.stream = new ShoeClient('ws://localhost:15000/streams/log');
    });
    it('should say hi', function (done) {
      var muxDemux = new MuxDemux(onStream);
      this.stream.pipe(muxDemux).pipe(this.stream);
      function onStream(stream) {
        if (stream.meta === 'terminal') {
          onTerminal(stream);
        }
      }
      function onTerminal(stream) {
        stream.on('data', function (data) {
          if (/HELLO/.test(data)) {
            done();
          }
        });
      }
    });
    it('should have web up', function (done) {
      request('http://localhost:15000/api/checkWebUp', function (err, res, body) {
        if (err) {
          done(err);
        } else if (res.statusCode !== 200) {
          done(new Error());
        } else {
          done();
        }
      });
    });
  });
});