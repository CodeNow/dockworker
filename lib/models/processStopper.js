var request = require('request');
var initialStopTime = 1000 * 30;
var stopTime = 1000 * 5;
if (process.env.NODE_ENV === 'testing') {
  initialStopTime = 30;
  stopTime = 5;
}
var stopTimer = setTimeout(stopProcess, initialStopTime);

function startTimeout() {
  clearTimeout(stopTimer);
  stopTimer = setTimeout(stopProcess, stopTime);
}
function stopProcess() {
  if (process.env.STOP_URL) {
    request.post(process.env.STOP_URL, function (err) {
      if (err) {
        setTimeout(stopProcess, stopTime);
        console.error(err);
      }
    });
  } else {
    console.error('NO STOP URL');
    process.exit(0);
  }
}

module.exports = {
  startTimeout: startTimeout
};