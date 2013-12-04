var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
var from = require('from');
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
  connected();
  var mx = new MuxDemux();
  var ts = mx.createStream('pty');
  var es = mx.createStream('ev');
  var term = pty.spawn(command, args, {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: serviceSrcDir,
      env: process.env
    });
  term.pipe(ts).pipe(term);
  var clientEvents = emitStream.fromStream(es.pipe(JSONStream.parse([true])));
  clientEvents.on('resize', function (x, y) {
    term.resize(x, y);
  });
  term.on('end', function () {
    remote.end();
  });
  remote.pipe(mx).pipe(remote);
  // cleanup
  var destroy = remote.destroy;
  remote.destroy = disconnect;
  function disconnect() {
    disconnected();
    ts.destroy();
    es.destroy();
    mx.destroy();
    term.kill();
    destroy.apply(remote, arguments);
    remote.destroy = destroy;
  }
}

module.exports = connect;