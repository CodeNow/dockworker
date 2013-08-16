var Terminal = require('term.js');
var shoe = require('shoe');


window.start = function () {
  onConnect(shoe('http://localhost:15000/log'));
};

function onConnect (stream) {
  var term = new Terminal({
    cols: 80,
    rows: 24
  });
  window.term = term;
  term.open(document.body);
  stream.pipe(term);
  term.end = term.destroy;

  var interval = setInterval(resize,500);
  setTimeout(function () {
    clearInterval(interval);
  }, 2000);
  
  function resize () {
    x = document.body.clientWidth / term.element.offsetWidth;
    y = document.body.clientHeight / term.element.offsetHeight;
    x = (x * term.cols) | 0;
    y = (y * term.rows) | 0;
    x -= 1;
    y -= 2;
    term.resize(x, y);
  }
  window.onresize = function (event) {
    resize();
  }
}