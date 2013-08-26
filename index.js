var cleanup = require('./lib/cleanup');

cleanup.doCleanUp( function (err) {
  if (!err) {
    require('./lib/launchServices');
    require('./lib/webStreams');
    require('./lib/appCtrl');
    require('./lib/server').listen(15000);
  }
});
