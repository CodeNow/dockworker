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
  tail.stdin.write('tail -f > '+file+' \n');
  console.log("start");

  tail.stdout.on('data', function (data) {
    console.log("data: "+data);
    // ignore first lines since this will be init commands
    if (isStarted) {
      stream.write(data.toString());
    } else {
      isStarted = true;
      console.log("isStarted:"+isStarted);
    }
  });

  tail.stdout.on('error', function (data) {
      console.log("error: "+data);
    });

  tail.stdout.on('err', function (data) {
    console.log("err: "+data);
  });
}

module.exports = historyTail;
