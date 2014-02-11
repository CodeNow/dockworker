var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var processStopper = require('../models/processStopper');
var serviceSrcDir = process.env.RUNNABLE_USER_DIR || '/root';
var pty = require('pty.js');
var MuxDemux = require('mux-demux');
var tail = require('./fileTail.js');
var terminalLogDir = process.env.RUNNABLE_TERMLOG_DIR || '/.terminalLog';
var fs = require('fs');

function connect(command, args, remote) {
  var muxDemux, terminalStream, clientEventsStream,
    terminal, terminalLogStream, cols = 80, rows = 30;
  setupStreams();
  setupCleanup();

  function setupStreams () {
    muxDemux = new MuxDemux();
    clientEventsStream = muxDemux.createStream('clientEvents');
    terminalStream = muxDemux.createStream('terminal');
    terminalLogStream = muxDemux.createStream('terminalLog');
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
    clientEvents.on('ping', function () {
      processStopper.startTimeout();
    });
    remote.pipe(muxDemux).pipe(remote);
    // create and tail -f terminal command log file
    //tail(terminalLogDir, terminalLogStream);
  }

  function setupCleanup () {
    var orginalDestroy = remote.destroy;
    remote.destroy = disconnect;
    function disconnect() {
      remote.destroy = orginalDestroy;
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
