var crypto = require('crypto');
/*
 * in charge of creating new users inserting their sessionId to db
 * logging in and authenticating user sessions to know if a session should be accepted or rejected
 *
 */
function userController(userDb, sessionDb){
	var self = this;
	self.userDb = userDb;
	self.sessionDb = sessionDb;
	self.appSpecifc = "ActWUfs5bYWM2ktnTurS+R2QwJc4ATiA1t9GsmNwScz";
}

/*
 * signs the user up. if the username already exists then returns an error "in-user"
 * otherwise the user is added to the db and inserts a sessionId associated to user into the database 
* @data
 *     json with the username, password and email
 */
userController.prototype.signup = function(data, callback) {
	var self = this;
	var username = data.username;
	var password = data.password;
	var userSalt = self.random();
	var hashedPass = self.hash(password, username, userSalt);
	if (!username || username == "" || !password || password == "")
		return callback("empty user");
	self.userDb.checkUnique(username, function(error, unique) {
		if (error || !unique)
			return callback("in-use");
			self.userDb.addUser(username, hashedPass, userSalt, data.email, function(error) {
			if (error)
				return callback(error);
			var session = self.random();
			self.sessionDb.addSession(username, session, function(error) {
				callback(error, session);
			});
		});
	});
}

/*
 * logs the user in and adds a sessionId to the db, if the credentials are correct. otherwise returns an error
 * @data
 *     json with the username and password
 */
userController.prototype.login = function(data, callback) {
    var self = this;
	var username = data.username;
	var password = data.password;
	if (!username || username == "" || !password || password == "")
		return callback("empty user");
    self.userDb.getUserSalt(username, function(error, salt) {
        if (error && callback) callback(error);
        else {
            var hashedPass = self.hash(password, data.username, salt);
            self.userDb.authenticateUser(username, hashedPass,
                function(error, result) {
                    if (error || !result)
						return callback(error, result);
					var session = self.random();
		        	self.sessionDb.addSession(username, session, function(error) {
						callback(error, session);
					});
				}
            );
        }
    });
}

/*
 * creates a random crypto string for salt and sessionId
 */
userController.prototype.random = function() {
	var self = this;
	return crypto.createHmac('sha256', self.appSpecifc).
                  update("" + Math.random() + Math.random() +
                              Math.random()).digest('hex');
}

/*
 * deletes a sessionId from the db
 */
userController.prototype.logout = function(username, sessionId, callback) {
	var self = this;
	self.sessionDb.removeSession(username, sessionId, callback);
}

/*
 * checks if the tuple username and sessionId is a valid one
 */
userController.prototype.authenticateSession = function(username, sessionId, callback) {
	var self = this;
	if (!sessionId)
		return callback("unauthorized", false);
	self.sessionDb.checkValid(username, sessionId, callback);
}

/*
 * returns a sha512 hash of the password
 */
userController.prototype.hash = function(password, username, userSalt) {
	var self = this;
	return crypto.createHmac("sha512", userSalt).update(password +
		self.appSpecifc).digest("base64");
}

module.exports = userController;
