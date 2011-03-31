function ServerNoteController() {
	var self = this;
};

var ServerNote = require('./ServerNote');

/**
 * returns all the notes for the specific user
 * @returns array of Notes
 */
ServerNoteController.prototype.getUserNotes = function(userId) {
	json = JSON.parse('{"note1" : "hello world"}');
	return [json];
};

ServerNoteController.prototype.getNote = function(noteId, userId) {
	json = JSON.parse('{"note1" : "hello world", "geo" : "latlong..."}');
	return new ServerNote("noam", json);
};

module.exports = ServerNoteController;