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
	self.ndb.findUserNotes(userId, since, callback);
};

ServerNoteController.prototype.findSingleNote = function(noteId, userId, callback) {
	self.ndb.findSingleNote(noteId, callback);
};

/**
 * destroy's the note from the server's datastore
 */
ServerNoteController.prototype.deleteNote = function(note, callback) {
	self.ndb.deleteNote(note, callback);
};

/**
 * saves a new note
 * @returns the id of the note
 */
ServerNoteController.prototype.insertNewNote = function(note, callback) {
	self.ndb.insertNote(note, callback)
};

/**
 * updaets a particular note
 * @returns the id of the note
 */
ServerNoteController.prototype.updateNote = function(note, callback) {
	self.ndb.updateNote(note, callback)
};

module.exports = ServerNoteController;
