/* jshint browser: true */
require('es5-shimify');
var Terminal = require('term.js');
var shoe = require('shoe');
var remoteResize;
var MuxDemux = require('mux-demux');
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
var away = require('away');
var url;
var firstLoad = true;
var stream;

var timer = away(1000 * 60 * 10);
timer.on('idle', disconnect);
timer.on('active', reconnect);

window.onfocus = onFocus;
window.onblur = onBlur;
window.start = onStart;

function message (msg) {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(msg, '*');
  }
}

function onFocus() {
  document.body.className = 'focused';
}
function onBlur() {
  document.body.className = '';
}
function onStart(inputUrl) {
  if (document.hasFocus && document.hasFocus()) {
    onFocus();
  }
  url = inputUrl || url;
  // shim
  var type = url.split('/')[2];
  if (type !== 'log') {
    message('stream:' + type);
  }
  onConnect();
}
function onConnect() {
  stream = shoe(url);
  var muxDemux = new MuxDemux(onStream);
  stream.pipe(muxDemux).pipe(stream);
  stream.on('end', reconnect);
  stream.on('connect', hideLoader);
}
function disconnect() {
  console.log('DIS');
  message('term:dis');
  stream.removeListener('end', reconnect);
  stream.end();
}
function reconnect() {
  console.log('RE');
  if (window.term) {
    document.body.removeChild(window.term.element);
  }
  firstLoad = true;
  showLoader();
  setTimeout(onConnect, 5000);
}
function onStream(stream) {
  if (firstLoad) {
    firstLoad = false;
    hideLoader();
  }
  if (stream.meta === 'terminal') {
    onTerminal(stream);
  }
  if (stream.meta === 'clientEvents') {
    onClientEventsStream(stream);
  }
  if (stream.meta === 'terminalLog') {
    onTerminalLog(stream);
  }
}
function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  message('hide:loader');
}
function showLoader() {
  document.getElementById('loader').style.display = 'block';
  message('show:loader');
}
function onTerminalLog(stream) {
  stream.on('data', function (data) {
    message('term:data'+data);
  });
}
function onTerminal(stream) {
  window.pty = stream;
  var term = window.term = new Terminal({
      cols: 80,
      rows: 24,
      useStyle: true,
      screenKeys: true
    });
  stream.on('data', function (data) {
    if (/\[1;32mExecuting Build Command: /.test(data)) {
      console.log('BUILD');
      message('stream:build');
    }
    if (/\[1;32mExecuting Run Command: /.test(data)) {
      console.log('RUN');
      message('stream:run');
    }
    if (/Process exited with code: /.test(data)) {
      console.log('ERROR');
      message('stream:error');
    }
  });
  term.on('data', stream.write.bind(stream));
  term.open();
  stream.pipe(term);
  term.end = term.destroy;
  var resizeTerm = resize.bind(null, term);
  resizeTerm();
  setTimeout(resizeTerm, 1000);
  window.onresize = resizeTerm;
}
function resize(term) {
  var x = document.body.clientWidth / term.element.offsetWidth;
  var y = document.body.clientHeight / term.element.offsetHeight;
  x = x * term.cols | 0;
  y = y * term.rows | 0;
  term.resize(x, y);
  if (typeof remoteResize === 'function') {
    remoteResize(x, y);
  }
}
function onClientEventsStream(stream) {
  var query = require('querystring').parse(window.location.search.slice(1));
  var options = query.options ? JSON.parse(query.options) : null;
  var args = options && options.args ? options.args : [];
  var env = options && options.env ? options.env : {};
  var clientEvents = new EventEmitter();
  emitStream.toStream(clientEvents).pipe(JSONStream.stringify()).pipe(stream);
  remoteResize = function (x, y) {
    clientEvents.emit('resize', x, y);
  };
  clientEvents.emit('startTerminal', args, env);
  setInterval(function ping () {
    clientEvents.emit('ping', true);
  }, 1000);
}
