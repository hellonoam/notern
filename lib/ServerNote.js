/**
 * Constructor for server notes
 */
function ServerNote(owner, json) {
	this.json = json;
	this.owner = owner;
	if (json.lastModified)
		this.lastModified = json.lastModified;
	if (json.id)
		this.id = json.id;
};

/**
 * destroy's the note from the server's datastore
 */
ServerNote.prototype.destroy = function() {
  // removes the note from the datastore
};

/**
 * saves a particular note
 * @returns the id of the note
 */
ServerNote.prototype.save = function(callback) {
  // adds the id to the note
	this.json.noteId = "tralala";

  // save the note to the server's datastore
	if (callback)
		callback();
};

module.exports = ServerNote;
