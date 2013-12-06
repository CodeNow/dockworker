console.log('HELLO');

require('http').createServer(function (req, res) {
  res.end('hello');
}).listen(8080);

process.on('exit', function () {
  console.log('GOODBYE');
});

//setTimeout(process.exit, 100);