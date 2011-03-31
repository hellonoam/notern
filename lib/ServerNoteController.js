function ServerNoteController() {
	var self = this;
};

var ServerNote = require('./ServerNote');

/**
 * returns all the notes for the specific user
 * @returns array of Notes
 */
ServerNoteController.prototype.getUserNotes = function(since, userId, callback) {
	json = JSON.parse('{"nodeId" : "id", "lastModified":"' + new Date() + '", "geo" : "latlong..."}');
	if (callback)
		callback([json]);
};

ServerNoteController.prototype.getNote = function(noteId, userId, callback) {
	json = JSON.parse('{"nodeId" : "id", "lastModified":"' + new Date() + '", "geo" : "latlong..."}');
	if (callback)
		callback(json);
};

module.exports = ServerNoteController;