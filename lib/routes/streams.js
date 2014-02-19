var shoe = require('shoe');
var server = require('../server');
var createDomain = require('domain').create;
var command = require('../models/command');
var connector = require('../controllers/connector');

function termHandler(remote) {
  var domain = createDomain();
  domain.add(remote);
  domain.on('error', termError.bind({ domain: domain }));
  domain.run(function() {
    connector('bash', [], remote);
  });
}
function logHandler(remote) {
  var domain = createDomain();
  domain.add(remote);
  domain.on('error', termError.bind({ domain: domain }));
  domain.run(function() {
    connector('bash', ['-c', command.getFullCommand()], remote);
  });
}
function termError(err) {
  console.error('termsock error');
  console.error(err.stack);
  this.domain.members.forEach(cleanup);
}
function cleanup(stream) {
  if (typeof stream.destroy === 'function') {
    stream.destroy();
  }
  if (typeof stream.kill === 'function') {
    stream.kill();
  }
}

var termSock = shoe(termHandler);
termSock.install(server, '/streams/terminal');
//termSock.on('log', console.log.bind(console, 'term'));

var logSock = shoe(logHandler);
logSock.install(server, '/streams/log');
//logSock.on('log', console.log.bind(console, 'log'));