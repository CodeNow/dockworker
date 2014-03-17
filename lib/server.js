var http = require('http');
var debug = require('controllers/debugAdder.js');

debug.addForHttp(http);
module.exports = http.createServer();