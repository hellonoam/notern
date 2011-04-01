/**
 * Dependencies of the notern application
 */
var express = require('express'),
	  util  = require("util"),
	  fs    = require('fs'),
      
	 ServerNote   = require('./ServerNote'),
	 ServerNoteController = require('./ServerNoteController'),
     userController = require('./userController'),
     
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
	// var MemoryStore = require('connect/middleware/session/memory');
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

	app.post("/signup", function(req, res) {
		console.log("got request for signup");
		uc.signup(req.body, self.setCookieIfValidResponse);
	});

	app.post("/login", function(req, res) {
		console.log("got request for login");
		uc.login(req.body, self.setCookieIfValidResponse);
	});

	app.get("/logout", function(req, res) {
		uc.logout(req.cookies.username, req.cookies.key, function(error, data) {
			if (error)
				res.send("failed");
			else
				res.send("success");
		});
	});

	//gets all notes for a specific user
	app.get("/user/:username/notes", function(req, res) {
		var username = req.params.username;
		uc.authenticateSession(username, req.cookies, function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			var since = req.query.since || 0;
			console.log("request to get all notes for " + username +" since " + since);
			snc.findUserNotes(username, since, function(error, userNotes) {
				res.contentType('application/json');
				res.send(userNotes);
			});
		});
	});

	//creates a note
	app.post("/user/:username/notes", function(req, res) {
		var username = req.params.username;
		console.log("request to create note for " + username);
		uc.authenticateSession(username, req.cookies, function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			var newNote = new ServerNote(username, req.body);
			snc.insertNewNote(newNote);
      res.send("", 200);
		});
	});

	//gets a note
	app.get("/user/:username/notes/:noteId", function(req, res) {
		var username = req.params.username;
		var noteId = req.params.noteId;
		console.log("request for note " + noteId + " from " + username);
		uc.authenticateSession(username, req.cookies, function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			snc.findSingleNote(noteId, username, function(error, oldNoteJson) { 
				res.contentType('application/json');
				console.log("json " + oldNoteJson);
				res.send(oldNoteJson);
			});
		});
	});

	//udpates a note
	app.put("/user/:username/notes/:noteId", function(req, res) {
		var username = req.params.username;
		var noteId = req.params.noteId;
		uc.authenticateSession(username, req.cookies, function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			console.log("request to update note " + noteId + " from " + username);
			var updatedNote = new ServerNote(username, req.body);
			snc.updateNote(updatedNote);
		});
	});
	
	//delete a note
	app.delete("/user/:username/notes/:noteId", function(req, res) {
		var username = req.params.username;
		var noteId = req.params.noteId;
		uc.authenticateSession(username, req.cookies, function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			console.log("request to delete note " + noteId + " from " + username);
			var noteToDelete = new ServerNote(username, {"noteId" : noteId});
			snc.deleteNote(noteToDelete);
		});
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

Notern.prototype.setCookieIfValidResponse = function (error, data) {
	if (error)
		res.send("failed");
	else {
		res.cookie('username', req.username, { expires: new Date(Date.now() + 9000000), httpOnly: false });
		res.cookie('key', data, { expires: new Date(Date.now() + 9000000), httpOnly: true })
	}
}

/**
 * Binds the express server to port settings.port
 */
Notern.prototype.listen = function() {
  var self = this;
  self.app.listen(self.settings.port);
  console.log("Started notern server on port " + self.settings.port);
};

module.exports = Notern;
