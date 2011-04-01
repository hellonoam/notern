// Rhodri Karim, rhodri@gmail.com

var sys    = require('sys'),
    sqlite = require('sqlite');

module.exports = DbController;

/**
 * The controller sets up the following tables:
 * - Users (Username TEXT PRIMARY KEY,
 *          Hash TEXT,
 *          Salt TEXT,
 *          Email TEXT)
 * - Notes (NoteId INTEGER,
 *          Username TEXT,
 *          Changed INTEGER,
 *          Json TEXT,
 *          PRIMARY KEY(NoteId, Username),
 *          FOREIGN KEY(Username) REFERENCES Users(Username))
 * - Sessions (Username TEXT,
 *             SessionId TEXT,
 *             Created TEXT,
 *             PRIMARY KEY(Username, SessionId),
 *             FOREIGN KEY(Username) REFERENCES Users(Username))
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
 * @param callback A function expecting an error as its first parameter.
 */
DbController.prototype.executeGuarded = function(sql, bindings, operation, callback) {
    var db = new sqlite.Database();
    try {
        db.open(this.path, function(error) {
            if (error) throw error;
            else db.execute(sql, bindings, function(error, rows) {
                if (error) throw error;
                else {
                    db.close(function(error) {}); // Dangerous?
                    if (operation) operation(rows);
                }
            });
        });
    } catch (error) {
        db.close(function(error) {});
        if (callback) callback(error);
    }
}

/**
 * Set up the required table structure, if it does not already exist.
 */
DbController.prototype.initializeTables = function() {
    var self = this;
    self.executeGuarded("CREATE TABLE IF NOT EXISTS Users(" +
                        "Username TEXT PRIMARY KEY, " +
                        "Hash TEXT, " +
                        "Salt TEXT, " +
                        "Email TEXT)",
                        [], function(rows) {
                        
    self.executeGuarded("CREATE TABLE IF NOT EXISTS Notes(" +
                        "NoteId INTEGER, " +
                        "Username TEXT, " +
                        "Changed INTEGER, " +
                        "Json TEXT, " +
                        "PRIMARY KEY(NoteId, Username), " +
                        "FOREIGN KEY(Username) REFERENCES Users(Username))",
                        [], function(rows) {
    
    self.executeGuarded("CREATE TABLE IF NOT EXISTS Sessions(" +
                        "Username TEXT, " +
                        "SessionId TEXT, " +
                        "Created TEXT, " +
                        "PRIMARY KEY(Username, SessionId), " +
                        "FOREIGN KEY(Username) REFERENCES Users(Username))");
    });
    });
}