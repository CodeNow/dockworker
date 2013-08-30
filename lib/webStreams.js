var spawn = require('child_process').spawn;
var shoe = require('shoe');
var pty = require('pty.js');
var dnode = require('dnode');
var MuxDemux = require('mux-demux');
var connectionCount = 0;
var lastConnect = Date.now();
var server = require('./server');
var createDomain = require('domain').create;

var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";

function disconnected () {
  connectionCount--;
  if (connectionCount === 0) {
    lastConnect = Date.now();
  }
}

function termHandler (remote) {
  var domain = createDomain();
  domain.add(remote);
  domain.on('error', termError.bind({
    domain: domain
  }));
  domain.run(connect.bind(null, 'bash', [], remote));
}

function connect (command, args, remote) {
  connectionCount++;
  var mx = MuxDemux();
  var ts = mx.createStream('pty');
  var ds = mx.createStream('dnode');

  var term = pty.spawn(command, args, {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: serviceSrcDir,
    env: process.env
  });
  term.pipe(ts).pipe(term);

  var d = dnode({
    resize: resize.bind({
      term: term
    })
  });
  d.pipe(ds).pipe(d);

  remote.pipe(mx).pipe(remote);
  remote.on('close', term.destroy.bind(term));
  
  // this is ideal
  // remote.once('close', disconnected);
  
  // this is working
  remote._destroy = remote.destroy;
  remote.destroy = function () {
    disconnected();
    remote._destroy();
    remote.destroy = remote._destroy;
  }
}

function resize (x, y) {
  this.term.resize(x, y);
}
function termError (err) {
  console.error('termsock error');
  console.error(err.stack);
  this.domain.members.forEach(cleanup);
}

function cleanup (stream) {
  if (typeof stream.destroy === 'function') {
    stream.destroy();
  }
  if (typeof stream.kill === 'function') {
    stream.kill();
  }
}

// both for smooth transition
shoe(termHandler).install(server, '/streams/terminal');

function logHandler (remote) {
  var domain = createDomain();
  domain.add(remote);
  domain.on('error', logError.bind({
    domain: domain
  }));
  domain.run(connect.bind(null, 'tail', ['-f', '/var/log/app.log'], remote));
}

function logError (err) {
  console.error('logsock error');
  console.error(err.stack);
  this.domain.members.forEach(cleanup);
}

shoe(logHandler).install(server, '/streams/log');

function connectionInfo () {
  return {
    connectionCount: connectionCount,
    lastConnect: lastConnect
  };
}

module.exports.connectionInfo = connectionInfo;
