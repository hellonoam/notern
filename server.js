var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('notern - geo tagged notes!\n');
}).listen(80, "0.0.0.0");
console.log('Server running.');

