function ServerNoteController() {
	var self = this;
};

var ServerNote = require('./ServerNote');
var tempNote= {noteId: "theNoteId", lastModified: 1234, geo: {lat: 12, lng: 24}};

/**
 * returns all the notes for the specific user
 * @returns array of Notes
 */
ServerNoteController.prototype.getUserNotes = function(since, userId, callback) {
	json = tempNote; // JSON.parse('{"noteId" : "id", "lastModified":"' + new Date() + '", "geo" : "latlong..."}');
	if (callback)
		callback([json]);
};

ServerNoteController.prototype.getNote = function(noteId, userId, callback) {
	json = tempNote; // JSON.parse('{"noteId" : "id", "lastModified":"1234", "geo" : {"lat":12, "lng":14}');
	if (callback)
		callback(json);
};

module.exports = ServerNoteController;
