// Rhodri Karim, rhodri@gmail.com

module.exports = NoteDbController;

/**
 * The NoteDbController expects the table:
 * - Notes (NoteId INTEGER,
 *          Username TEXT,
 *          Changed INTEGER,
 *          Json TEXT,
 *          PRIMARY KEY(NoteId, Username),
 *          FOREIGN KEY(Username) REFERENCES Users(Username))
 */

/**
 * Constructor for a NoteDbController.
 * @param db The DbController object for the current database.
 */
function NoteDbController(db) {
    this.db = db;
}

/**
 * Retrieve all notes for a given user from the database.
 * @param userId The ID of the user in question.
 * @param callback A function expecting (error, array of note JSON).
 */
NoteDbController.prototype.findUserNotes = function(username, since, callback) {
    this.db.executeGuarded(
            "SELECT json FROM notes WHERE username = ? AND changed > ?",
			[username, since],
            function(rows) {
			    var i = 0;
			    for (i = 0; i < rows.length; i++) {
                    rows[i] = JSON.parse(rows[i].Json);
			    }
                if (callback) callback(null, rows);
			},
            callback);
}

/**
 * Retrieve a specific note from the database.
 * @param noteId The ID of the note in question.
 * @param callback A function expecting (error, note JSON)
 */
NoteDbController.prototype.findSingleNote = function(noteId, username, callback) {
    this.db.executeGuarded(
            "SELECT json FROM notes WHERE noteid = ? AND username = ?",
			[noteId, username],
            function(rows) {
			    if (rows.length != 1) return {};
			    else if (callback) callback(JSON.parse(rows[0].Json));
			},
            callback);
}

/**
 * Insert a new note into the database.
 * @param note The ServerNote object to be inserted into the database.
 * @param callback A function expecting (error)
 */
NoteDbController.prototype.insertNote = function(note, callback) {
    this.db.executeGuarded(
            "INSERT INTO notes VALUES (?, ?, ?, ?)",
			[note.id, note.owner, note.lastUpdated,
             JSON.stringify(note.json)],
             null, callback);
}

/**
 * Update an existing note in the database.
 * @param note The new version of the ServerNote object to be updated.
 * @param callback A function expecting (error)
 */
NoteDbController.prototype.updateNote = function(note, callback) {
    this.db.executeGuarded(
            "UPDATE notes SET json = ?, changed = ? " +
			"WHERE noteid = ? AND username = ?",
			[JSON.stringify(note.json), note.lastModified,
			 note.id, note.owner],
             null, callback);
}

/**
 * Remove a note from the database.
 * @param note The ServerNote to be removed from the database.
 * @param callback A function expecting (error)
 */
NoteDbController.prototype.deleteNote = function(note, callback) {
    this.db.executeGuarded(
            "DELETE FROM notes WHERE noteid = ? AND username = ?",
			[note.id, note.owner],
            null, callback);
}