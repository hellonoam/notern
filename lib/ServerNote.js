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

module.exports = ServerNote;
