var spawn = require('child_process').spawn;
var fs = require('fs');

// Launch Services
var runnableServiceCommands = process.env.RUNNABLE_SERVICE_CMDS || "";

runnableServiceCommands.split(';').forEach(function (commandLine) {
  if (commandLine) {
    var commandArray = commandLine.trim().split(" ");
    var log = fs.createWriteStream("/var/log/" +
      commandArray.join("_").replace(/\//g, '_') +
      ".log", { flags: 'a' });
    var binary = commandArray.shift();
    var binaryArgs = commandArray;
    var proc = spawn(binary, binaryArgs);
    proc.stdout.pipe(log);
    proc.stderr.pipe(log);
  }
});