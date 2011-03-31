
/**
 * Module dependencies.
 */

var express = require('express'),
	util    = require('util'),
	fs      = require('fs');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

// '/' with get or post gets the index file in the public folder
app.get("/", index);
app.post("/", index);
function index(req, res) {
	res.writeHead(200, {"content-type": "text/html"});
	var rs = fs.createReadStream("./public/index.html");
	util.pump(rs, res);
}

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(80);
  console.log("Express server listening on port %d", app.address().port)
}
