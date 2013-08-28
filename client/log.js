require('es5-shimify');
var Terminal = require('term.js');
var shoe = require('shoe');
var dnode = require('dnode');
var remoteResize;
var MuxDemux = require('mux-demux');

window.start = onConnect;

function onConnect () {
  var stream = shoe('/streams/log');
  var muxDemux = MuxDemux(onStream);
  stream.pipe(muxDemux).pipe(stream);
  stream.on('end', reconnect);
}

function reconnect () {
  setTimeout(onConnect, 5000);
}

function onStream (stream) {
  if (stream.meta === 'pty') {
    onPty(stream);
  }
  if (stream.meta === 'dnode') {
    onDnode(stream);
  }
}

function onPty (stream) {
  var term = window.term =new Terminal({
    cols: 80,
    rows: 24,
    useStyle: true,
    screenKeys: true
  });
  term.open();
  stream.on('end', document.removeChild.bind(document.body, term.element));
  stream.on('data', writeToTerm.bind(null, term));
  term.end = endTerm;
  var resizeTerm = resize.bind(null, term);
  resizeTerm();
  setTimeout(resizeTerm, 1000);
  window.onresize = resizeTerm;
}

function noop () {}

function writeToTerm (term, data) {
  term.write(data.replace(/\r?\n/g, '\r\n'));
}

function endTerm () {
  console.log('END');
}

function resize (term) {
  x = document.body.clientWidth / term.element.offsetWidth;
  y = document.body.clientHeight / term.element.offsetHeight;
  x = (x * term.cols) | 0;
  y = (y * term.rows) | 0;
  x -= 1;
  y -= 2;
  term.resize(x, y);
  if (typeof remoteResize === 'function') {
    remoteResize(x, y);
  }
}

function onDnode (stream) {
  var d = dnode();
  d.on('remote', onRemote);
  stream.pipe(d).pipe(stream);
}

function onRemote (remote) {
  remoteResize = remote.resize.bind(remote);
}