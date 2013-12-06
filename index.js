require('./lib/controllers/dockCleaner');
require('./lib/controllers/serviceCommands');
require('./lib/app');
require('./lib/server').listen(15000);

process.on('SIGTERM', process.exit);