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
 * Retrieve a specific note from the database.
 * @param noteId The ID of the note in question.
 * @param callback A function expecting the note object.
 */
DbController.prototype.selectNote = function(noteId, callback) {
    var db = new sqlite.Database();
    try {

    db.open(this.path, function(error) {
	    if (error) throw error;

	    var text = "SELECT json FROM notes WHERE noteid = ?";
	    db.prepare(text, function(error, statement) {
		    if (error) throw error;
		    statement.bindArray([noteId], function(error) {
			    if (error) throw error;
			    statement.fetchAll(function(error, rows) {
				    if (error) throw error;
				    statement.finalize(function(error) {
					    db.close(function(error) {});
				    });

				    if (rows.length != 1) return {};
				    else if (callback)
					    callback(JSON.parse(rows[0].JSON));
				    });
			    }); 
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
controller.selectNote(1, function(object) {console.log(object)});