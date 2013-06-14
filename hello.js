require('http').createServer(function (req, res) {
  res.end('hello');
  console.log('hi');
}).listen(80);
console.log('hello');