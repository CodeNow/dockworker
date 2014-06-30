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
        var buffer = '';
        var found = false;
        stream.on('data', function (data) {
          buffer += data;
          console.log(data);
          if (/HELLO/.test(buffer) && !found) {
            found = true;
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