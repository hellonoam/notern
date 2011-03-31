var express = require('express'),
	  util  = require("util"),
	  fs    = requrie('fs');


// Configuration

function Notern(config) {
  var self = this;
  self.settings = config;
  self.init();
};

Notern.prototype.init = function() {
  var self = this;
  self.app = module.exports = express.createServer();
  var app = self.app;
  app.configure(function(){
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.staticProvider(__dirname + '/../public'));
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
};

Notern.prototype.listen = function() {
  var self = this;
  self.app.listen(self.settings.port);
  console.log("running on port 80");
};

module.exports = Notern;
