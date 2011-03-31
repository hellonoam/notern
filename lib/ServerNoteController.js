function ServerNoteController(db) {
	var self = this;
	this.db = db;
};

var ServerNote = require('./ServerNote');
var tempNote= {noteId: "theNoteId", lastModified: 1234, geo: {lat: 12, lng: 24}};

/**
 * returns all the notes for the specific user
 * @returns array of Notes
 */
ServerNoteController.prototype.findUserNotes = function(since, userId, callback) {
	this.db.findUserNotes(userId, callback);
};

ServerNoteController.prototype.findSingleNote = function(noteId, userId, callback) {
	this.db.findSingleNote(noteId, callback);
};

/**
 * destroy's the note from the server's datastore
 */
ServerNoteController.prototype.deleteNote = function(note) {
	this.db.deleteNote(note);
};

/**
 * saves a new note
 * @returns the id of the note
 */
ServerNoteController.prototype.insertNewNote = function(note, callback) {
	this.db.insertNewNote(note, callback)
};

/**
 * updaets a particular note
 * @returns the id of the note
 */
ServerNoteController.prototype.updateNote = function(note, callback) {
	this.db.updateNote(note, callback)
};


module.exports = ServerNoteController;
