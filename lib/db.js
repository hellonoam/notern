// Rhodri Karim, rhodri@gmail.com

var sys    = require('sys'),
    sqlite = require('sqlite');

module.exports = DbController;

/**
 * The controller expects the following tables:
 * - Notes (NoteID INTEGER PRIMARY KEY AUTOINCREMENT,
 *          UserKey INTEGER,
 *          Changed INTEGER,
 *          JSON TEXT)
 */

/**
 * Constructor for a database controller.
 * @param path The path to the database file.
 */
function DbController(path) {
    this.path = path;
}

/**
 * Execute an SQL statement and run an operation on its results, safely.
 * @param sql The SQL statement to be run, with ? in place of values.
 * @param bindings An array of values to be inserted into the statement.
 * @param operation A function expecting an array of database rows.
 */
DbController.prototype.executeGuarded = function(sql, bindings, operation) {
    var db = new sqlite.Database();
    try {
	db.open(this.path, function(error) {
		if (error) throw error;
		else db.execute(sql, bindings, function(error, rows) {
			if (error) throw error;
			else {
			    db.close(function(error) {});
			    if (operation) operation(rows);
			}
		});
        });
    } catch (error) {
	db.close(function(error) {});
	throw error;
    }
}

/**
 * Set up the required table structure, if it does not already exist.
 */
DbController.prototype.initializeTables = function() {
    this.executeGuarded("CREATE TABLE IF NOT EXISTS notes(" +
			"NoteID INTEGER PRIMARY KEY AUTOINCREMENT, " +
			"UserKey INTEGER, Changed INTEGER, JSON TEXT)");
}

/**
 * Retrieve all notes for a given user from the database.
 * @param userId The ID of the user in question.
 * @param callback A function expecting an array of note JSON.
 */
DbController.prototype.findUserNotes = function(userId, callback) {
    this.executeGuarded("SELECT json FROM notes WHERE userkey = ?",
			[userId], function(rows) {
			    var i = 0;
			    for (i = 0; i < rows.length; i++) {
				rows[i] = JSON.parse(rows[i].JSON);
			    }
			    if (callback) callback(rows);
			});
}

/**
 * Retrieve a specific note from the database.
 * @param noteId The ID of the note in question.
 * @param callback A function expecting the note JSON.
 */
DbController.prototype.findSingleNote = function(noteId, callback) {
    this.executeGuarded("SELECT json FROM notes WHERE noteid = ?",
			[noteId], function(rows) {
			    if (rows.length != 1) return {};
			    else if (callback)
				callback(JSON.parse(rows[0].JSON));
			});
}

/**
 * Insert a new note into the database.
 * @param note The ServerNote object to be inserted into the database.
 * @param callback A function expecting the authoritative note JSON.
 */
DbController.prototype.insertNewNote = function(note, callback) {
    var self = this;
    var serverTime = (new Date()).getTime();
    self.executeGuarded("INSERT INTO notes (UserKey, Changed) VALUES (?, ?)",
			[note.owner, serverTime], function(rows) {
    
    self.executeGuarded("SELECT NoteID FROM notes " +
			"WHERE UserKey = ? AND Changed = ?",
			[note.owner, serverTime],
			function(rows) {
   
    if (rows.length != 1) throw "Expected to find a single note";
    else {
	var id = rows[0].NoteID;
	note.id = id;
	note.json.id = id;
	self.executeGuarded("UPDATE notes SET Changed = ?, JSON = ? WHERE NoteID = ?",
			    [note.lastModified, JSON.stringify(note.json), id]); 
     if (callback) callback(note);
    }
    });
    });
}

/**
 * Update an existing note in the database.
 * @param note The new version of the ServerNote object to be updated.
 */
DbController.prototype.updateNote = function(note) {
    this.executeGuarded("UPDATE notes SET json = ?, changed = ? " +
			"WHERE noteid = ? AND userkey = ?",
			[JSON.stringify(note.json), note.lastModified,
			 note.id, note.owner]);
}

/**
 * Remove a note from the database.
 * @param note The ServerNote to be removed from the database.
 */
DbController.prototype.deleteNote = function(note) {
    this.executeGuarded("DELETE FROM notes WHERE noteid = ? AND userkey = ?",
			[note.id, note.owner]);
}