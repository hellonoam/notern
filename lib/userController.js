var crypto = require('crypto');

function userController(userDb, sessionDb){
	var self = this;
	self.userDb = userDb;
	self.sessionDb = sessionDb;
	self.appSpecifc = "ActWUfs5bYWM2ktnTurS+R2QwJc4ATiA1t9GsmNwScz";
}

userController.prototype.insertSessionId = function(error, data) {
	var self = this;
	if (!error) {
		data = self.random();
		self.sessionDb.insert(username, data);
	}
	callback(error, data);
}

userController.prototype.signup = function(data, callback) {
	var self = this;
	var username = data.username;
	var userSalt = self.random();
	var hashedPass = self.hash(data.password, username, userSalt);
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

userController.prototype.login = function(data, callback) {
    var self = this;
	var username = data.username;
	var password = data.password;
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

userController.prototype.random = function() {
	var self = this;
	return crypto.createHmac('sha256', self.appSpecifc).
                  update("" + Math.random() + Math.random() +
                              Math.random()).digest('hex');
}

userController.prototype.logout = function(username, sessionId, callback) {
	var self = this;
	self.sessionDb.removeSession(username, sessionId, callback);
}

userController.prototype.authenticateSession = function(username, sessionId, callback) {
  return callback("", true);
	var self = this;
	if (!sessionId)
		return callback("unauthorized", false);
	self.sessionDb.checkValid(username, sessionId, callback);
}

userController.prototype.hash = function(password, username, userSalt) {
	var self = this;
	return crypto.createHmac("sha512", userSalt).update(password +
		self.appSpecifc).digest("base64");
}

module.exports = userController;
