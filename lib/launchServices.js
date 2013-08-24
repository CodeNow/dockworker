var spawn = require('child_process').spawn;
var fs = require('fs');
var createDomain = require('domain').create;
var children  = [];

// Launch Services
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS || "";

runnableServiceCommands.split(';').forEach(function (commandLine) {
  if (commandLine) {
    var domain = createDomain();
    domain.on('error', function (err) {
      console.error('runnableServiceCommands error');
      console.error('commandLine: ' + commandLine);
      console.error(err.stack);
      domain.members.forEach(function (stream) {
        if (typeof stream.destroy === 'function') {
          stream.destroy();
        }
        if (typeof stream.kill === 'function') {
          stream.kill();
        }
      });
    });
    domain.run(function () {
      var commandArray = commandLine.trim().split(" ");
      
      var out = fs.openSync("/var/log/" +
        commandArray.join("_").replace(/\//g, '_') +
        ".log", 'a' );
      var err = fs.openSync("/var/log/" +
        commandArray.join("_").replace(/\//g, '_') +
        ".log", 'a' );
      
      var binary = commandArray.shift();
      var binaryArgs = commandArray;
      var proc = spawn(binary, binaryArgs, {detached: true, stdio: [ 'ignore', out, err ]});
      proc.on("exit", function() {
		console.log("Exited: " + commandLine);
      });
      proc.on("SIGTERM", function() {
		console.log("SIGTERM: " + commandLine);
      });
      children.push(proc);
      proc.unref();
      domain.add(proc);
    });
  }
});

/*
process.on('SIGTERM', function() {
  console.log('killing', children.length, 'child processes');
  children.forEach(function(child) {
    child.kill("SIGTERM");
  });
});
*/
