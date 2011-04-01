// Rhodri Karim, rhodri@gmail.com

module.exports = SessionDbController;

/**
 * The SessionDbController expects the tables:
 * - Sessions (Username TEXT,
 *             SessionId TEXT,
 *             Created TEXT,
 *             PRIMARY KEY(Username, SessionId),
 *             FOREIGN KEY(Username) REFERENCES Users(Username))
 */

/**
 * Constructor for a SessionDbController.
 * @param db The DbController object for the current database.
 */
function SessionDbController(db) {
    this.db = db;
}

/**
 * Adds a user's session to the database.
 * @param username The user whose session we are adding.
 * @param session The user's session ID.
 * @param callback A function expecting (error).
 */
SessionDbController.prototype.addSession = function(username, session, callback) {
    var now = (new Date()).getTime();
    this.db.executeGuarded(
        "INSERT INTO sessions VALUES (?, ?, ?)",
        [username, session, now],
        function() { if (callback) callback(); },
        callback);
}

/**
 * Checks a user's session ID against the database.
 * @param username The user whose session we are checking.
 * @param session The supplied session ID.
 * @param callback A function expecting (error, result) where
 *                 result is true if the user's session exists.
 */
SessionDbController.prototype.checkValid = function(username, session, callback) {
    this.db.executeGuarded(
        "SELECT sessionid FROM sessions WHERE username = ?",
        [username],
        function(rows) {
            if (callback) {
                if (rows.length != 1)
                    callback(null, false);
                else {
                    var i = 0;
                    for (i = 0; i < rows.length; i++) {
                        if (session == rows[i].SessionId)
                            // TODO: check if session is too old?
                            callback(null, true);
                            return;
                    }
                    callback(null, false);
                }
            }
        },
        callback);
}

/**
 * Remove a session from the database. 
 * @param username The user whose session we are removing.
 * @param session The session ID to remove.
 * @param callback A function expection (error). 
 */
SessionDbController.prototype.removeSession = function(username, session, callback) {
    this.db.executeGuarded(
        "DELETE FROM sessions WHERE username = ? AND sessionid = ?",
        [username, session],
        function() { if (callback) callback(); },
        callback);
}