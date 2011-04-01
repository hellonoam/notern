function ServerNoteController(ndb) {
	var self = this;
	self.ndb = ndb;
};

var tempNote= {noteId: 5678, lastModified: 1234, geo: {lat: 12, lng: 24}};

/**
 * returns all the notes for the specific user
 * @returns array of Notes
 */
ServerNoteController.prototype.findUserNotes = function(userId, since, callback) {
	this.ndb.findUserNotes(userId, since, callback);
};

ServerNoteController.prototype.findSingleNote = function(noteId, username, callback) {
	this.ndb.findSingleNote(noteId, username, callback);
};

/**
 * destroy's the note from the server's datastore
 */
ServerNoteController.prototype.deleteNote = function(note, callback) {
	this.ndb.deleteNote(note, callback);
};

/**
 * saves a new note
 * @returns the id of the note
 */
ServerNoteController.prototype.insertNewNote = function(note, callback) {
	this.ndb.insertNote(note, callback)
};

/**
 * updaets a particular note
 * @returns the id of the note
 */
ServerNoteController.prototype.updateNote = function(note, callback) {
	this.ndb.updateNote(note, callback)
};

module.exports = ServerNoteController;
