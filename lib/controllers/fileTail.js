// anandp
// this module used to track a file for changes
// It creates a file and then starts the tailing
// will terminate after process pid dies
// file =  path to file to track
// 
var spawn = require('child_process').spawn;
var tail = spawn('bash');
// Used because 2 commands come in before user gets to type.
// service commands and the echo below
var isStarted = 0;

function fileTail(file, stream, pid) {
  if(isStarted) {
    return;
  }
  tail.stdin.write('echo "" > ' + file + ' \n');
  tail.stdin.write('tail --pid=' + pid + ' -f ' + file + ' \n');

  tail.stdout.on('data', function (data) {
    // ignore first lines since this will be init commands
    if (isStarted > 1) {
      stream.write(data.toString());
    } else {
      isStarted++;
    }
  });
}

// kill tail process on exit
function stop() {
  process.kill(tail);
}

module.exports.begin = fileTail;
module.exports.stop = stop;
