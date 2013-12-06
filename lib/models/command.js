var startCommand = process.env.RUNNABLE_START_CMD || 'date && sleep 1000';
var buildCommand = process.env.RUNNABLE_BUILD_CMD || '';

function getStartCommand () {
  return startCommand;
}

function getBuildCommand () {
  return buildCommand;
}

function getFullCommand () {
  var command = buildCommand ?
    'echo "\033[1;32mExecuting Build Command: \033[0;37m' + buildCommand + '\033[0m\n" && ' +
    buildCommand + ' && ' : '';
  command += 'echo "\n\n\033[1;32mExecuting Run Command: \033[0;37m' + startCommand + '\033[0m\n" && ';
  command += startCommand + ' && ';
  command += 'echo "\n\033[1;32mProcess exited successfully\033[0m" && sleep 5 || ';
  command += 'echo "\n\033[0;31mProcess exited with code: \033[0;37m$?\033[0m" && sleep 1000';
  return command;
}

function setStartCommand (command) {
  startCommand = command;
}

function setBuildCommand (command) {
  buildCommand = command;
}

module.exports = {
  getStartCommand: getStartCommand,
  getBuildCommand: getBuildCommand,
  getFullCommand: getFullCommand,
  setStartCommand: setStartCommand,
  setBuildCommand: setBuildCommand
};