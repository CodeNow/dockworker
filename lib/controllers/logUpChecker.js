var ShoeClient = require('../ShoeClient');
var MuxDemux = require('mux-demux');
var command = require('../models/command');

function checkLogUp (cb) {
  var stream = new ShoeClient('ws://localhost:15000/streams/log');
  var muxDemux = new MuxDemux(onStream);
  var startCmd = command.getStartCommand();
  stream.pipe(muxDemux).pipe(stream);
  function onStream(stream) {
    if (stream.meta === 'terminal') {
      onTerminal(stream);
    }
  }
  function onTerminal(stream) {
    var re = new RegExp(startCmd+'\r\n');
    var timeout = setTimeout(timeoutError, 1000);
    var err;
    stream.on('data', function (data) {
      if (re.test(data) && !err) {
        clearTimeout(timeout);
        cb();
      }
    });
    stream.write('echo '+startCmd+'\n');
    function timeoutError () {
      err = new Error('timeout');
      cb(err);
    }
  }
}

module.exports = checkLogUp;