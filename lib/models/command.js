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
    buildCommand + ' && ' : '';
  command += startCommand;
  command += ' || sleep 1000';
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