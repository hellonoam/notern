var crypto = require('crypto');

function userController(userDb, sessionDb){
	self = this;
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
	self.userDb.add(username, hashedPass, userSalt, data.email, self.insertSessionId);
}

userController.prototype.login = function(data, callback) {
	var username = data.username;
	var hashsedPass = self.hash(data.password, username);
	self.userDb.authenticate(username, hashsedPass, self.insertSessionId);
}

userController.prototype.random = function() {
	return crypto.createHmac('sha256', self.appSpecifc).update("" + Math.random() + Math.random() +
			Math.random()).digest('hex');
}

userController.prototype.authenticateSession = function(username, sessionId, callback) {
	self.sessionDb.valid(username, sessionId, callback);
}

userController.prototype.logout = function(username, sessionId, callback) {
	self.sessionDb.remove(username, sessionId, callback);
}

userController.prototype.hash = function(password, username, userSalt) {
	if (!userSalt)
		userSalt = self.userDb.getUserSalt(username);
	return crypto.createHmac("sha512", userSalt).update(password +
		self.appSpecifc).digest("base64");
}

module.exports = userController;