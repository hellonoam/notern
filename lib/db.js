var sys    = require('sys'),
    sqlite = require('../vendor/sqlite');

/**
 * The controller expects the following tables:
 * - Notes (NoteID INTEGER PRIMARY KEY AUTOINCREMENT,
 *          UserKey INTEGER,
 *          Changed INTEGER,
 *          JSON TEXT)
 */

function DbController(path) {
    this.path = path;
}

/**
 * Retrieve all notes for a give user from the database.
 * @param userId The ID of the user in question.
 * @param callback A function expecting an array of note objects.
 */
DbController.prototype.findUserNotes = function(userId, callback) {
    var db = new sqlite.Database();
    try {

	db.open(this.path, function(error) {
		if (error) throw error;
		db.execute("SELECT json FROM notes WHERE userkey = ?",
			   [userId], function(error, rows) {
			       if (error) throw error;

			       var i = 0;
			       for (i = 0; i < rows.length; i++) {
				   rows[i] = JSON.parse(rows[i].JSON);
			       }

			       if (callback) callback(rows);
			   });
	    });
    } catch (error) {
	db.close(function(error) {});
	throw error;
    }
}

/**
 * Retrieve a specific note from the database.
 * @param noteId The ID of the note in question.
 * @param callback A function expecting the note object.
 */
DbController.prototype.findSingleNote = function(noteId, callback) {
    var db = new sqlite.Database();
    try {

    db.open(this.path, function(error) {
	    if (error) throw error;
	    db.execute("SELECT json FROM notes WHERE noteid = ?",
		       [noteId], function(error, rows) {
			   if (error) throw error;
			   db.close(function(error) {});
		
			   if (rows.length != 1) return {};
			   else if (callback)
			       callback(JSON.parse(rows[0].JSON));
		       });
	});

    } catch (error) {
	db.close(function(error) {});
	throw error;
    }
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
controller.findUserNotes(666, function(object) {console.log(object)});