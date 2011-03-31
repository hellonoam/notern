function ServerNoteController() {};

/**
 * returns all the notes for the specific user
 * @returns array of Notes
 */
ServerNoteController.prototype.getUserNotes = function(userId) {
	json = '{"note1" : "hello world"}';
	return [new ServerNote("noam", json)];
}

ServerNoteController.prototype.getNote = function(noteId) {
	json = '{"note1" : "hello world", "geo" : "latlong..."}';
	return new ServerNote("noam", json);
}