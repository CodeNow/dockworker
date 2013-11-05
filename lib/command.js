var command = module.exports = {
  cmd: null,
  args: null,
  set: function (commandString) {
    var commandArray = (commandString || "date").split(" ");
    command.cmd = commandArray.shift();
    command.args = commandArray;
  },
  toString: function () {
    var cmd = buildCmd;
    return (cmd.cmd + cmd.args.join(' ')).trim();
  }
};
// init
command.set(process.env.RUNNABLE_START_CMD);