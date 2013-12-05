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
    'echo "Executing Build Command: ' + buildCommand + '" && ' +
    buildCommand + ' && ' +
    'echo "Executing Run Command: ' + startCommand + '" && ' : '';
  command += startCommand + ' && ';
  command += 'echo "Process exited successfully" && sleep 5 || echo "Process exited with code $?" && sleep 1000';
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