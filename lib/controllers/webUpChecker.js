var portscanner = require('portscanner');

function checkWebUp (cb) {
  var timedout = false;
  var webTimeout = setTimeout(function webTimedout () {
    timedout = true;
    cb(new Error('timed out'));
  }, process.env.WEB_TIMEOUT || 5000);
  (function checkListening () {
    portscanner.checkPortStatus(process.env.WEB_PORT || 80, 'localhost', checkStatus);
    function checkStatus (err, status) {
      if (timedout) {
        return false;
        //console.error('timed out');
      } else if (err) {
        clearTimeout(webTimeout);
        cb(err);
      } else if (status === 'closed') {
        setTimeout(checkListening, 50);
      } else {
        clearTimeout(webTimeout);
        cb();
      }
    }
  })();
}

module.exports = checkWebUp;