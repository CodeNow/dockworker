var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var processStopper = require('../models/processStopper');
var connectionCount = 0;
var serviceSrcDir = process.env.RUNNABLE_USER_DIR || '/root';
var pty = require('pty.js');
var MuxDemux = require('mux-demux');

function connected() {
  connectionCount++;
  //console.log('connected', connectionCount);
  processStopper.stopTimeout();
}
function disconnected() {
  connectionCount--;
  //console.log('disconnected', connectionCount);
  if (connectionCount === 0) {
    processStopper.startTimeout();
  }
}

function connect(command, args, remote) {
  var muxDemux, terminalStream, clientEventsStream,
    terminal, cols = 80, rows = 30;
  connected();
  setupStreams();
  setupCleanup();

  function setupStreams () {
    muxDemux = new MuxDemux();
    clientEventsStream = muxDemux.createStream('clientEvents');
    terminalStream = muxDemux.createStream('terminal');
    terminal = pty.spawn(command, args, {
      name: 'xterm-color',
      cols: cols,
      rows: rows,
      cwd: serviceSrcDir,
      env: process.env
    });
    terminal.pipe(terminalStream).pipe(terminal);
    terminal.on('end', muxDemux.end);
    var clientEvents = emitStream
      .fromStream(clientEventsStream
        .pipe(JSONStream.parse([true])));
    clientEvents.on('resize', function (x, y) {
      terminal.resize(x, y);
    });
    remote.pipe(muxDemux).pipe(remote);
  }

  function setupCleanup () {
    var orginalDestroy = remote.destroy;
    remote.destroy = disconnect;
    function disconnect() {
      remote.destroy = orginalDestroy;
      disconnected();
      if (terminalStream) {
        terminalStream.destroy();
      }
      clientEventsStream.destroy();
      muxDemux.destroy();
      if (terminal) {
        terminal.kill();
      }
      remote.destroy();
    }
  }
}

module.exports = connect;