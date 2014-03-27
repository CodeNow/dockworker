require('./lib/controllers/dockCleaner');
require('./lib/controllers/serviceCommands');
require('./lib/app');
require('./lib/server').listen(15000);
var debug = require('./lib/controllers/debugAdder.js');
debug.addForProcess(process, "main process");