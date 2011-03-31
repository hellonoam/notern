/**
 * Dependencies of the notern application
 */
var express = require('express'),
	  util  = require("util"),
	  fs    = require('fs'),
	 ServerNote   = require('./ServerNote'),
	 ServerNoteController = require('./ServerNoteController');

var snc = new ServerNoteController();

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

  app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  });

  app.configure('production', function() {
    app.use(express.errorHandler()); 
  });

	//gets all notes for a specific user
	app.get("/user/:userId/notes", function(req, res) {
		var userId = req.params.userId;
		var since = req.query.since;
		console.log("request to get all notes for " + userId +" since " + since);
		snc.getUserNotes(since, userId, function(userNotes) {
			res.header('Content-Type', 'application/json');
			res.send(userNotes);
		});
	});

	//creates a note
	app.post("/user/:userId/notes", function(req, res) {
		var userId = req.params.userId;
		console.log("request to create note for " + userId);
		var newNote = new ServerNote(userId, req.body);
    console.log("returning:");
    console.log(newNote.json);
		newNote.save(function() {
			res.contentType('application/json');
			res.send(newNote.json);
		});
	});

	//gets a note
	app.get("/user/:userId/notes/:noteId", function(req, res) {
		var userId = req.params.userId;
		var noteId = req.params.noteId;
		console.log("request for note " + noteId + " from " + userId);
		res.header('Content-Type', 'application/json');
		snc.getNote(noteId, userId, function(oldNoteJson) { res.send(oldNoteJson); });
	});

	//udpates a note
	app.put("/user/:userId/notes/:noteId", function(req, res) {
		var userId = req.params.userId;
		var noteId = req.params.noteId;
		console.log("request to update note " + noteId + " from " + userId);
		var updatedNote = new ServerNote(userId, req.body);
		updatedNote.save();
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
