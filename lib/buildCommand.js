var buildCommand = module.exports = {
  cmd: null,
  args: null,
  set: function (commandString) {
    var commandArray = (commandString || "").split(" ");
    buildCommand.cmd = commandArray.shift();
    buildCommand.args = commandArray;
  },
  toString: function () {
    var cmd = buildCommand;
    return (cmd.cmd + cmd.args.join(' ')).trim();
  }
};
// init
buildCommand.set(process.env.RUNNABLE_BUILD_CMD);