// Rhodri Karim, rhodri@gmail.com

var sys    = require('sys'),
    sqlite = require('../vendor/sqlite');

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
			    operation(rows);
			}
		});
        });
    } catch (error) {
	db.close(function(error) {});
	throw error;
    }
}

/**
 * Retrieve all notes for a give user from the database.
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
DbController.prototype.insertNewNote = function(note) {
    var serverTime = (new Date()).getTime();
    this.executeGuarded("INSERT INTO notes (UserKey, Changed) VALUES (?, ?)",
			[note.owner, serverTime], function(rows) {
    
    this.executeGuarded("SELECT NoteID FROM notes " +
			"WHERE UserKey = ? AND Changed = ?",
			[note.owner, serverTime],
			function(rows) {
   
    if (rows.length != 1) throw "Expected to find a single note";
    else {
	var id = rows[0].NoteID;
	note.id = id;
	note.json.id = id;
	this.executeGuarded("UPDATE notes SET Changed = ?, JSON = ? WHERE NoteID = ?",
			    [note.lastModified, JSON.stringify(note.json), id]); 
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


var db = new sqlite.Database();

/**
db.open("tester.db", function(error) {
	var json = "{wank: \"poo\"}";
	db.executeScript("CREATE TABLE Notes (NoteID INTEGER PRIMARY KEY AUTOINCREMENT, UserKey INTEGER, Changed INTEGER, JSON TEXT);" +
			 "INSERT INTO Notes VALUES (NULL, 666, 3456, '" + json + "');",
			 function(error) {
			     if (error) throw error;
			 });
    });
*/

var controller = new DbController("tester.db");
// controller.findUserNotes(666, function(object) {console.log(object)});
// controller.findSingleNote(1, function(object) {console.log(object)});
// controller.insertNewNote({owner: 100, lastModified: 10, json: {poo: "wank"}}, function(object) {console.log(object)});
// controller.findUserNotes(100, function(object) {console.log(object)});