require('es5-shimify');
var Terminal = require('term.js');
var shoe = require('shoe');
var remoteResize;
var MuxDemux = require('mux-demux');
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
var url;
var firstLoad = true;

window.onfocus = onFocus;
window.onblur = onBlur;

window.start = onStart;

function onFocus () {
  document.body.className = 'focused';
}

function onBlur () {
  document.body.className = '';
}

function onStart(inputUrl) {
  if (document.hasFocus && document.hasFocus()) {
    onFocus();
  }
  url = inputUrl || url;
  onConnect();
}

function onConnect () {
  var stream = shoe(url);
  var muxDemux = MuxDemux(onStream);
  stream.pipe(muxDemux).pipe(stream);
  stream.on('end', reconnect);
  stream.on('connect', hideLoader);
}

function reconnect () {
  document.body.removeChild(window.term.element);
  firstLoad = true;
  showLoader();
  setTimeout(onConnect, 5000);
}

function onStream (stream) {
  if (firstLoad) {
    firstLoad = false;
    hideLoader();
  }
  if (stream.meta === 'pty') {
    onPty(stream);
  }
  if (stream.meta === 'ev') {
    onEmitStream(stream);
  }
}

function hideLoader () {
  document.getElementById('loader').style.display = 'none';
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage('hide:loader', '*');
  }
}

function showLoader () {
  document.getElementById('loader').style.display = 'block';
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage('show:loader', '*');
  }
}

function onPty (stream) {
  window.pty = stream;
  var term = window.term = new Terminal({
    cols: 80,
    rows: 24,
    useStyle: true,
    screenKeys: true
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

function resize (term) {
  var x = document.body.clientWidth / term.element.offsetWidth;
  var y = document.body.clientHeight / term.element.offsetHeight;
  x = (x * term.cols) | 0;
  y = (y * term.rows) | 0;
  term.resize(x, y);
  if (typeof remoteResize === 'function') {
    remoteResize(x, y);
  }
}

function onEmitStream (stream) {
  var clientEvents = new EventEmitter();
  var serverEvents = emitStream.fromStream(stream.pipe(JSONStream.parse([true])));
  emitStream.toStream(clientEvents).pipe(JSONStream.stringify()).pipe(stream);
  remoteResize = function (x, y) {
    clientEvents.emit('resize', x, y);
  };
  serverEvents.on('code', function (code) {
    window.parent.postMessage(JSON.stringify({
      type: 'code',
      code: code
    }), '*');
  });
}