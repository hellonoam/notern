require.paths.unshift(__dirname + "/vendor");

/**
 * Module dependencies.
 */

process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

var Notern = require('./lib/notern');

new Notern({
  port: 8000
}).listen();
