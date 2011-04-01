// Rhodri Karim, rhodri@gmail.com

module.exports = UserDbController;

/**
 * The UserDbController expects the tables:
 * - Users (Username TEXT PRIMARY KEY,
 *          Hash TEXT,
 *          Email TEXT)
 */

/**
 * Constructor for a UserDbController.
 * @param db The DbController object for the current database.
 */
function UserDbController(db) {
    this.db = db;
}

/**
 * Checks whether a given username already exists.
 * @param username The string username to check.
 * @param callback A function expecting (error, result) where
 *                 result is true if username is unique.
 */
UserDbController.prototype.checkUnique(username, callback) {
    this.db.executeGuarded(
        "SELECT username FROM users WHERE username = ?",
        [username],
        function(rows) {
            if (callback) {
                if (rows.length > 0)
                    callback(null, false);
                else
                    callback(null, true);
                }
        },
        callback);
}

/**
 * Adds a user to the database.
 * NOTE: this does not check uniqueness.
 * @param username The string username to add.
 * @param hash A salted hash of the user's password.
 * @param email The user's email.
 * @param callback A function expecting (error).
 */
UserDbController.protoype.addUser(username, hash, email, callback) {
    this.db.executeGuarded(
        "INSERT INTO users VALUES (?, ?, ?)",
        [username, hash, email],
        null, callback);
}

/**
 * Checks a user's salted hash against the database.
 * @param username The string username to authenticate.
 * @param hash The supplied hash of the user's password.
 * @param callback A function expecting (error, result) where
 *                 result is true if user's hash matches.
 */
UserDbController.prototype.authenticateUser(username, hash, callback) {
    this.db.executeGuarded(
        "SELECT hash FROM users WHERE username = ?",
        [username],
        function(rows) {
            if (callback) {
                if (rows.length > 1)
                    callback("Username not unique.");
                else if (rows.length != 1)
                    callback("Username does not exist.");
                else if (rows[0].hash == hash)
                    callback(null, true);
                else
                    callback(null, false);
            }
        },
        callback);
}