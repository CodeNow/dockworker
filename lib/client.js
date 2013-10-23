require('es5-shimify');
var Terminal = require('term.js');
var shoe = require('shoe');
var dnode = require('dnode');
var remoteResize;
var MuxDemux = require('mux-demux');
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
  if (stream.meta === 'dnode') {
    onDnode(stream);
  }
}

function hideLoader () {
  document.getElementById('loader').style.display = 'none';
}

function showLoader () {
  document.getElementById('loader').style.display = 'block';
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
  stream.on('end', window.parent.postMessage.bind(window.parent, 'done', '*'));
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

function onDnode (stream) {
  var d = dnode();
  d.on('remote', onRemote);
  stream.pipe(d).pipe(stream);
}

function onRemote (remote) {
  remoteResize = remote.resize.bind(remote);
}