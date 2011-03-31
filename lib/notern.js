/**
 * Dependencies of the notern application
 */
var express = require('express'),
	  util  = require("util"),
	  fs    = requrie('fs');

/**
 * The initialize function of the Notern app
 * It takes a config javascript object.
 * The configuration parameter should include:
 *    port
 */
function Notern(config) {
  var self = this;
  self.settings = config;
  self.init();
};


/**
 * Performs the initialization of the notern application
 * Starts the express server
 */
Notern.prototype.init = function() {
  var self = this;
  self.app = module.exports = express.createServer();
  var app = self.app;
  app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/../public'));
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


/**
 * Binds the express server to port settings.port
 */
Notern.prototype.listen = function() {
  var self = this;
  self.app.listen(self.settings.port);
  console.log("Started notern server on port " + self.settings.port);
};

module.exports = Notern;
