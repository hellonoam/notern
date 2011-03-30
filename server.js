var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('notern - geo tagged notes!\n');
}).listen(80, "64.30.141.213");
console.log('Server running at http://64.30.141.213:80');

