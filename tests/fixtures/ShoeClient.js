var util = require('util');
var ws = require('ws');
var DuplexStream = require('stream').Duplex;

var ShoeClient = module.exports = function ShoeClient(uri) {
  if(!(this instanceof ShoeClient)) {
    return new ShoeClient(uri);
  }
  DuplexStream.apply(this);
  this.setEncoding('utf8');
  this._connected = false;
  this._writeQueue = [];

  uri = uri + '/websocket';
  this._ws = new ws(uri);
  var self = this;
  this._ws.on('open', function() {
    self._connected = true;
    self.emit('open');
    self._flushQueue();
  });
  this._ws.on('message', function(message) {
    self.push(message.toString());
  });
};
util.inherits(ShoeClient, DuplexStream);

ShoeClient.prototype._write = function (chunk, encoding, callback) {
  if(!this._connected) {
    this._writeQueue.push(chunk.toString());
    return callback();
  }
  this._ws.send(chunk.toString());
  callback();
};

ShoeClient.prototype._flushQueue = function () {
  var message = this._writeQueue.shift();
  while(message) {
    this._ws.send(message);
    message = this._writeQueue.shift();
  }
};

ShoeClient.prototype._read = function () {
};