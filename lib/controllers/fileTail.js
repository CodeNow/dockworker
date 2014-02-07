// anandp
// this module used to track a file for changes
// file =  path to file to track
// 
function fileTail(file, stream) {
  var spawn = require('child_process').spawn;
  var tail = spawn('tail', ['-f', file]);
  tail.stdout.on('data', function (data) {
    stream.write(data.toString());
  });
}

module.exports = fileTail;
