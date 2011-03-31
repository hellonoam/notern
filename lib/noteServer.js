/**
 * Constructor for server notes
 */
function Note(owner, json, date) {
	this.json = json;
	this.owner = owner;
	if (date)
		this.lastChanged = date;
	else
		this.lastChanged = new Date();
};

/**
 * destroy's the note from the server's datastore
 */
Note.prototype.destroy = function() {
  // removes the note from the datastore
};

/**
 * saves a particular note
 */
Note.prototype.save = function() {
  // save the note to the server's datastore
};

/**
 * returns all the notes for the specific user
 * @returns array of Notes
 */
function getAllUsersNotes(userId) {
	return [new Note("noam", {"note1" : "hello world"})];
}

function getNote(noteId) {
	json = JSON.parse('{"note1" : "hello world", "geo" : "latlong..."}')
	return new Note("noam", json);
}