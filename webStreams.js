var spawn = require('child_process').spawn;
var shoe = require('shoe');
var pty = require('pty.js');
var dnode = require('dnode');
var MuxDemux = require('mux-demux');
var connectionCount = 0;
var lastConnect = Date.now();
var server = require('./server');

function disconnected () {
  connectionCount--;
  if (connectionCount === 0) {
    lastConnect = Date.now();
  }
}

var termsock = shoe(function (remote) {
  connectionCount++;
  var mx = MuxDemux();
  var ts = mx.createStream('pty');
  var ds = mx.createStream('dnode');

  var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: serviceSrcDir,
    env: process.env
  });
  term.pipe(ts).pipe(term);

  var d = dnode({
    resize: function (x, y) {
      term.resize(x, y);
    }
  });
  d.pipe(ds).pipe(d);

  remote.pipe(mx).pipe(remote);
  remote._destroy = remote.destroy;
  remote.destroy = function () {
    disconnected();
    remote._destroy();
  }
});

termsock.install(server, '/terminal');

var logsock = shoe(function (remote) {
  connectionCount++;
  var tail = spawn('tail', ['-f', '/var/log/app.log']);
  tail.stdout.pipe(remote, { end: false });
  remote._destroy = remote.destroy;
  remote.destroy = function () {
    disconnected();
    remote._destroy();
  }
});

logsock.install(server, '/log');

server.listen(15000);

module.exports.connectionInfo = function () {
  return {
    connectionCount: connectionCount,
    lastConnect: lastConnect
  };
};