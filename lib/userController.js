var crypto = require('crypto');

function userController(userDb, sessionDb){
	var self = this;
	self.userDb = userDb;
	self.sessionDb = sessionDb;
	self.appSpecifc = "ActWUfs5bYWM2ktnTurS+R2QwJc4ATiA1t9GsmNwScz";
}

userController.prototype.insertSessionId = function(error, data) {
	if (!error) {
		data = self.random();
		self.sessionDb.insert(username, data);
	}
	callback(error, data);
}

userController.prototype.signup = function(data, callback) {
	var username = data.username;
	var userSalt = self.random();
	var hashedPass = self.hash(data.password, username, userSalt);
	this.userDb.addUser(username, hashedPass, userSalt, data.email, callback);
}

userController.prototype.login = function(data, callback) {
    var self = this;
    self.userDb.getUserSalt(data.username, function(error, salt) {
        if (error && callback) callback(error);
        else {
            var hashsedPass = self.hash(data.password, data.username, salt);
            self.userDb.authenticateUser(data.username, hashsedPass,
                function(error, result) {
                    if (!error && result) {
                        session = self.random();
                        self.sessionDb.addSession(data.username, session)
                    }
                    if (callback) callback(error, result);
                }
            );
        }
    });
}

userController.prototype.random = function() {
	return crypto.createHmac('sha256', self.appSpecifc).
                  update("" + Math.random() + Math.random() +
                              Math.random()).digest('hex');
}

userController.prototype.logout = function(username, sessionId, callback) {
	self.sessionDb.remove(username, sessionId, callback);
}

userController.prototype.authenticateSession = function(data, callback) {
	self.sessionDb.checkValid(data.username, data.sessionID, callback);
}

userController.prototype.hash = function(password, username, userSalt) {
	return crypto.createHmac("sha512", userSalt).update(password +
		self.appSpecifc).digest("base64");
}

module.exports = userController;