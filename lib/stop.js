var request = require('request');
var stopTimer = setTimeout(stopProcess, 1000 * 30);

function stopTimeout () {
	clearTimeout(stopTimer);
}

function startTimeout () {
	stopTimer = setTimeout(stopProcess, 1000 * 5);
}

function stopProcess () {
  if (process.env.STOP_URL) {
    request.post(process.env.STOP_URL, function (err, res, body) {
      if (err) {
        setTimeout(doom, 1000 * 5);
        console.error(err);
      } else {
        console.log('STOPPED');
      }
    });
  } else {
    console.error('NO STOP URL');
    process.exit(0);
  }
}

module.exports = {
  stopTimeout: stopTimeout,
  startTimeout: startTimeout
};