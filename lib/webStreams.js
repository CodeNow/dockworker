var shoe = require('shoe');
var pty = require('pty.js');
var MuxDemux = require('mux-demux');
var server = require('./server');
var createDomain = require('domain').create;
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
var tail = require('./tail');
var from = require('from');
var runCommand = require('./runCommand');
var processStopper = require('./processStopper');

var connectionCount = 0;
var serviceSrcDir = process.env.RUNNABLE_USER_DIR || "/root";

function connected () {
  connectionCount++;
  console.log('connected', connectionCount);
  processStopper.stopTimeout();
}

function disconnected () {
  connectionCount--;
  console.log('disconnected', connectionCount);
  if (connectionCount === 0) {
    processStopper.startTimeout();
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
  connected();
  var mx = MuxDemux();
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

  remote.pipe(mx).pipe(remote);

  // cleanup
  var destroy = remote.destroy;
  remote.destroy = disconnect;
  function disconnect () {
    disconnected();
    ts.destroy();
    es.destroy();
    mx.destroy();
    term.kill();
    destroy.apply(remote, arguments);
    remote.destroy = destroy;
  }
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
var termSock = shoe(termHandler);
termSock.install(server, '/streams/terminal');
termSock.on('log', console.log.bind(console, 'term'));

function logHandler (stream) {
  return function (remote) {
    var domain = createDomain();
    domain.add(remote);
    domain.on('error', logError.bind({
      domain: domain
    }));
    domain.run(follow);
    function follow () {
      connected();
      var mx = MuxDemux();
      var ts = mx.createStream('pty');
      var es = mx.createStream('ev');
      var fs = from(function getChunk (count, next) {
        if (tail.buffer.length > count) {
          fs.emit('data', tail.buffer[count]);
          next();
        } else {
          tail.once('data', function onTail (data) {
            fs.emit('data', data);
            next();
          });
        }
      });
      var serverEvents = new EventEmitter();
      if (runCommand.child) {
        if (stream === 'build' && !runCommand.buildRunning) {
          serverEvents.emit('code', runCommand.buildCode); // build already finished
          ts.end();
        }
        else {
          listenToChild();
        }
      }
      else {
        runCommand.dispatch.once('attached:child', listenToChild); // child not attached, listen for event
      }
      function listenToChild (processName) {
        runCommand.child.on('close', function (code) {
          serverEvents.emit('code', code);
          ts.end();
        });
      }
      es.pipe(emitStream(serverEvents).pipe(JSONStream.stringify())).pipe(es);
      fs.pipe(ts);
      mx.pipe(remote);
      // cleanup
      var destroy = remote.destroy;
      remote.destroy = disconnect;
      function disconnect () {
        disconnected();
        ts.destroy();
        es.destroy();
        mx.destroy();
        fs.destroy();
        destroy.apply(remote, arguments);
        remote.destroy = destroy;
      }
    }
  }
}

function logError (err) {
  console.error('logsock error');
  console.error(err.stack);
  this.domain.members.forEach(cleanup);
}

var logSock = shoe(logHandler('log'));
logSock.install(server, '/streams/log');
logSock.on('log', console.log.bind(console, 'log'));

var buildSock = shoe(logHandler('build'));
buildSock.install(server, '/streams/build');
buildSock.on('log', console.log.bind(console, 'build'));
