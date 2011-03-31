/**
 * Constructor for server notes
 */
function ServerNote(owner, json, date) {
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
ServerNote.prototype.destroy = function() {
  // removes the note from the datastore
};

/**
 * saves a particular note
 */
ServerNote.prototype.save = function() {
  // save the note to the server's datastore
};

module.exports = ServerNote;