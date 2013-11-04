var command = module.exports = {
  cmd: null,
  args: null,
  set: function (commandString) {
    var commandArray = (commandString || "date").split(" ");
    command.cmd = commandArray.shift();
    command.args = commandArray;
  }
};
// init
command.set(process.env.RUNNABLE_START_CMD);