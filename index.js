require('./lib/dockCleaner');
require('./lib/serviceCommands');
require('./lib/webStreams');
require('./lib/app');
require('./lib/server').listen(15000);

process.on('SIGTERM', process.exit);