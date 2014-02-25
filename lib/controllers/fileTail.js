// anandp
// this module used to track a file for changes
// It creates a file and then starts the tailing
// will terminate after process pid dies
// file =  path to file to track
// 
var spawn = require('child_process').spawn;
var tail = spawn('bash');
// we want to enable logging only when user can interact with terminal
// this stops our injected commands from getting logged
var isEnabled = false;
var isStarted = false;

function fileTail(file, stream, pid) {
  if (isStarted) {
    return;
  }
  isStarted = true;

  tail.stdin.write('echo "" > ' + file + ' \n');
  tail.stdin.write('tail --pid=' + pid + ' -f ' + file + ' \n');

  tail.stdout.on('data', function (data) {
    if (isEnabled) {
      stream.write(data.toString());
    }
  });
}

// kill tail process on exit
function stop() {
  process.kill(tail.pid);
}

// start broadcasting data
function enable() {
  isEnabled = true;
}

// pause broadcaseting of data
function pause () {
  isEnabled = false;
}

module.exports.begin = fileTail;
module.exports.stop = stop;
module.exports.enable = enable;
module.exports.pause = pause;