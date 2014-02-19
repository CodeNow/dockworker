// anandp
// this module used to kill all process of a group
// 

function killChildrenByGroup(gid) {
  var exec = require('child_process').exec;
  console.log("about to kill");
  exec('kill -- -'+gid);
  console.log("should have killed");
}

module.exports = killChildrenByGroup;