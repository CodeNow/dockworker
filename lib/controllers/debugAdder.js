// debugAdder
// adds debug messages to streams and processes

function addForStream(stream, name) {
	stream.on('end', function() {
		console.log(new Date() + " stream: "+name + " = end");
	});
	stream.on('close', function() {
		console.log(new Date() + " stream: "+name + " = close");
	});
	stream.on('error', function(err) {
		console.log(new Date() + " stream: "+name + " = err: "+err);
	});
	stream.on('finish', function() {
		console.log(new Date() + " stream: "+name + " = finish");
	});
}

function addForChildProcess(childProcess, name) {
	childProcess.on('exit', function(code, sig) {
		console.log(new Date() + " Child process: "+name + " = exit code: "+code+ "sig: "+sig);
	});
	childProcess.on('close', function(code, sig) {
		console.log(new Date() + " Child process: "+name + " = close code: "+code+ "sig: "+sig);
	});
	childProcess.on('disconnect', function(err) {
		console.log(new Date() + " Child process: "+name + " = disconnect: "+err);
	});
	childProcess.on('error', function(err) {
		console.log(new Date() + " Child process: "+name + " = err: "+err.toString());
	});
	debug.addForStream(childProcess.stdin,  name+":stdin");
	debug.addForStream(childProcess.stdout, name+":stdout");
	debug.addForStream(childProcess.stderr, name+":stderr");
}

function addForProcess(process, name) {
	process.on('exit', function(code) {
		console.log(new Date() + " process: "+name + " = exit code: "+code);
	});
	process.on('uncaughtException', function(err) {
		console.log(new Date() + " process: "+name + " = uncaughtException: "+err);
	});
	debug.addForStream(process.stdin,  name+":stdin");
	debug.addForStream(process.stdout, name+":stdout");
	debug.addForStream(process.stderr, name+":stderr");
}

function addForHttp(http, name) {
	stream.on('clientError', function(exception, socket) {
		console.log(new Date() + " http: "+name + " = clientError "+exception+" socket: " + socket.toString());
	});
	stream.on('close', function() {
		console.log(new Date() + " http: "+name + " = close");
	});
	stream.on('finish', function() {
		console.log(new Date() + " http: "+name + " = finish");
	});
	stream.on('error', function() {
		console.log(new Date() + " http: "+name + " = error");
	});
}

module.exports.addForStream = addForStream;
module.exports.addForChildProcess = addForChildProcess;
module.exports.addForProcess = addForProcess;