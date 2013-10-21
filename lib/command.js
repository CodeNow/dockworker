var startCommandArray = (process.env.RUNNABLE_START_CMD || "date").split(" ");
module.exports = {
  cmd: startCommandArray.shift(),
  args: startCommandArray
};