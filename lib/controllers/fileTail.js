// anandp
// this module used to track a file for changes
// It creates a file and then starts the tailing
// will terminate after process pid dies
// file =  path to file to track
// 
var isStarted = false;
function fileTail(file, stream, pid) {
  var spawn = require('child_process').spawn;
  var tail = spawn('bash');
  // first create new blank file
  tail.stdin.write('echo "" > '+file+' \n');
  tail.stdin.write('tail --pid='+pid+' -f '+file+' \n');

  tail.stdout.on('data', function (data) {
    // ignore first lines since this will be init commands
    if (isStarted) {
      stream.write(data.toString());
    } else {
      isStarted = true;
    }
  });
}

module.exports = fileTail;
