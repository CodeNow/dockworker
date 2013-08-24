var rimraf = require("rimraf");
var fs = require("fs");

//clean all emphemeral directories
rimraf.sync("/run");
rimraf.sync("/var/log");

//recreate empty directories
fs.mkdirSync("/run");
fs.mkdirSync("/run/lock");
fs.mkdirSync("/var/log");
