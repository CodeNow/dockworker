// anandp
// this module used to track a file for changes
// It creates a file and then starts the tailing
// file =  path to file to track
// 
var isStarted = false;
function historyTail(file, stream) {
  var spawn = require('child_process').spawn;
  var tail = spawn('bash');
  // first clear our history
  tail.stdin.write('echo start > '+file+' \n');
  tail.stdin.write('tail -f '+file+' \n');
  console.log("starting tail");

  tail.stdout.on('data', function (data) {
    // ignore first lines since this will be init commands
    if (isStarted) {
      stream.write(data.toString());
      console.log("data: "+data.toString());
    } else {
      isStarted = true;
      console.log("isStarted:"+isStarted);
    }
  });
}

module.exports = historyTail;
