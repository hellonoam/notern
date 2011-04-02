/**
 * Dependencies of the notern application
 */
var express = require('express'),
	  util  = require("util"),
	  fs    = require('fs'),
	 Cookies = require('cookies'),
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

	/*
	 * signs up the user with username pass and email in req.body
	 * returns in-user if the username is in use
	 */
	app.post("/signup", function(req, res) {
		var self = this;
		var cookies = new Cookies(req, res, "noternRulz");
		console.log("got request for signup");
		uc.signup(req.body, function(error, data) {
			if (error)
				return res.send(error);
			var date = new Date();
			date.setMonth(date.getMonth()+10);
			cookies.set('username', req.body.username, { expires : date });
			cookies.set('sessionId', data, { expires : date });
			res.send("", 200);
		});
	});

	/*
	 * logs the user in with the username and pass in req.body
	 * returns a 401 if credentials are invalid
	 */
	app.post("/login", function(req, res) {
		var self = this;
		var cookies = new Cookies(req, res, "noternRulz");
		console.log("got request for login");
		uc.login(req.body, function(error, data) {
		// uc.login({username:req.params.username, password:"pass"}, function(error, data) {
			if (error)
				return res.send("failed");
			if (!data)
				return res.send('unauthorized - invalid credentials', { 'Content-Type': 'text/plain' }, 401);
			var date = new Date();
			date.setMonth(date.getMonth()+10);
			cookies.set('username', req.body.username, { expires : date });
			cookies.set('sessionId', data, { expires : date });
			res.send("", 200);
		});
	});

	/*
	 * logs the user out by deleting all cookies
	 * and deleting sessionId from the db
	 */
	app.get("/logout", function(req, res) {
		var cookies = new Cookies(req, res, "noternRulz");
		console.log("got request to logout");
		uc.logout(cookies.get("username"), cookies.get("sessionId"), function(error, data) {
			if (error)
				return res.send("failed");
			cookies.set("username", "");
			cookies.set("sessionId", "");
			res.send("success");
		});
	});

	/*
	 * gets all notes for a specific user
	 */
	app.get("/user/:username/notes", function(req, res) {
		var cookies = new Cookies(req, res, "noternRulz");
		var username = req.params.username;
		var since = req.query.since || 0;
		console.log("request to get all notes for " + username +" since " + since);
		uc.authenticateSession(username, cookies.get("sessionId"), function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			snc.findUserNotes(username, since, function(error, userNotes) {
				res.contentType('application/json');
				res.send(userNotes);
			});
		});
	});

	/*
	 * creates a note for a specific user
	 */
	app.post("/user/:username/notes", function(req, res) {
		var username = req.params.username;
		var cookies = new Cookies(req, res, "noternRulz");
		console.log("request to create note for " + username);
		uc.authenticateSession(username, cookies.get("sessionId"), function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			var newNote = new ServerNote(username, req.body);
			snc.insertNewNote(newNote);
			res.send("", 200);
		});
	});

	/*
	 * gets a user specifc note by note id
	 */
	app.get("/user/:username/notes/:noteId", function(req, res) {
		var cookies = new Cookies(req, res, "noternRulz");
		var username = req.params.username;
		var noteId = req.params.noteId;
		console.log("request for note " + noteId + " from " + username);
		uc.authenticateSession(username, cookies.get("sessionId"), function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			snc.findSingleNote(noteId, username, function(error, oldNoteJson) { 
				res.contentType('application/json');
				console.log("json " + oldNoteJson);
				res.send(oldNoteJson);
			});
		});
	});

	/*
	 * udpates a user specifc note by noteId
	 */
	app.put("/user/:username/notes/:noteId", function(req, res) {
		var cookies = new Cookies(req, res, "noternRulz");
		var username = req.params.username;
		var noteId = req.params.noteId;
		uc.authenticateSession(username, cookies.get("sessionId"), function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			console.log("request to update note " + noteId + " from " + username);
			var updatedNote = new ServerNote(username, req.body);
			snc.updateNote(updatedNote);
		});
	});
	
	/* 
	 * deletes a user specific note by noteId
	 */
	app.delete("/user/:username/notes/:noteId", function(req, res) {
		var cookies = new Cookies(req, res, "noternRulz");
		var username = req.params.username;
		var noteId = req.params.noteId;
		uc.authenticateSession(username, cookies.get("sessionId"), function(error, response) {
			if (response != true)
				return  res.send('unauthorized - invalid cookie', { 'Content-Type': 'text/plain' }, 401);
			console.log("request to delete note " + noteId + " from " + username);
			var noteToDelete = new ServerNote(username, {"noteId" : noteId});
			snc.deleteNote(noteToDelete);
      res.send('', 200);
		});
	});

  // Serve the cache manifest:
  app.get("/notern.manifest", manifest);
  function manifest(req, res) {
    res.writeHead(200, {"content-type": "text/cache-manifest"});
    var rs = fs.createReadStream("./public/notern.manifest");
    util.pump(rs, res);
  }

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
