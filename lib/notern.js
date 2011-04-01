/**
 * Dependencies of the notern application
 */
var express = require('express'),
	  util  = require("util"),
	  fs    = require('fs'),
      
	 ServerNote   = require('./ServerNote'),
	 ServerNoteController = require('./ServerNoteController'),
     UserController = require('./userController'),
     
	 DbController = require('./DbController'),
	 NoteDbController = require('./NoteDbController'),
     UserDbController = require('./UserDbController'),
     SessionDbController = require('./SessionDbController');

var db = new DbController("notern.db");
var ndb = new NoteDbController(db);
var udb = new UserDbController(db);
var sdb = new SessionDbController(db);

var snc = new ServerNoteController(ndb);
var uc = new userController(udb, sdb);

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

	db.initializeTables();

	self.app = module.exports = express.createServer();
	var app = self.app;
	app.configure(function(){
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(app.router);
		app.use(express.static(__dirname + '/../public'));
		app.use(express.cookieParser());
		app.use(express.session({ secret: "noternRulz" }));
	});

	app.configure('development', function() {
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	app.configure('production', function() {
		app.use(express.errorHandler()); 
	});

	app.get("/signup", function(req, res) {
		console.log("got request for signup");
		uc.signup(req.body, function(error) {
			if (error)
				res.send("failed");
			else
				res.send("success");
		});
	});

	app.get("/login", function(req, res) {
		uc.login(req.body, function(error, data) {
			if (error)
				res.send("failed");
			else
				;//send cookie
		})
	});

	//gets all notes for a specific user
	app.get("/user/:userId/notes", function(req, res) {
		var userId = req.params.userId;
		var since = req.query.since;
		console.log("request to get all notes for " + userId +" since " + since);
		snc.findUserNotes(userId, since, function(userNotes) {
			res.contentType('application/json');
			res.send(userNotes);
		});
	});

	//creates a note
	app.post("/user/:userId/notes", function(req, res) {
		var userId = req.params.userId;
		console.log("request to create note for " + userId);
		var newNote = new ServerNote(userId, req.body);
		snc.insertNewNote(newNote, function() {
			res.contentType('application/json');
			res.send(newNote.json);
		});
	});

	//gets a note
	app.get("/user/:userId/notes/:noteId", function(req, res) {
		var userId = req.params.userId;
		var noteId = req.params.noteId;
		console.log("request for note " + noteId + " from " + userId);
		snc.findSingleNote(noteId, userId, function(oldNoteJson) { 
			res.contentType('application/json');
			res.send(oldNoteJson); 
		});
	});

	//udpates a note
	app.put("/user/:userId/notes/:noteId", function(req, res) {
		var userId = req.params.userId;
		var noteId = req.params.noteId;
		console.log("request to update note " + noteId + " from " + userId);
		var updatedNote = new ServerNote(userId, req.body);
		snc.updateNote(updatedNote);
	});
	
	//delete a note
	app.delete("/user/:userId/notes/:noteId", function(req, res) {
		var userId = req.params.userId;
		var noteId = req.params.noteId;
		console.log("request to delete note " + noteId + " from " + userId);
		var noteToDelete = new ServerNote(userId, {"noteId" : noteId});
		snc.deleteNote(noteToDelete);
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
