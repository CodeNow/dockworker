// anandp
// this module used to kill all process of a group
// 

function killChildrenOfProcess() {
  var pid = process.pid;
  var exec = require('child_process').exec;
  console.log("about to kill "+pid);
  exec("kill -- -$( ps opgid="+pid+" | tr -d ' ' )");
  console.log("should have killed");
}

module.exports = killChildrenOfProcess;