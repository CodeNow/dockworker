var ShoeClient = require('../ShoeClient');
var MuxDemux = require('mux-demux');
var command = require('../models/command');
var debug = require('./debugAdder.js');
var testCmd = "echo runnabletest";

// check if terminal is responsive.
// send an echo test command to terminal stream and create timeout error if unreachable
function checkTermUp (cb) {
  var stream = new ShoeClient('ws://localhost:15000/streams/terminal');
  var muxDemux = new MuxDemux(onStream);
  stream.pipe(muxDemux).pipe(stream);
  debug.addForStream(stream, "termUpChecker stream");

  function onStream(stream) {
    if (stream.meta === 'terminal') {
      onTerminal(stream);
    }
  }
  function onTerminal(stream) {
    var timeout = setTimeout(timeoutError, 5000);
    var err;
    var fullData = '';
    stream.on('data', function (data) {
      // grab output of echo command
      fullData += data;
      var re = new RegExp(testCmd);
      if (re.test(fullData) && !err) {
        clearTimeout(timeout);
        cb();
      }
    });
    stream.write(testCmd+'\n');
    function timeoutError () {
      err = new Error('timeout');
      cb(err);
    }
  }
}

module.exports = checkTermUp;