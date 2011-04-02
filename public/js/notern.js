
/**
 * Init function of the notern app.
 * It initializes shit
 */
function Notern() {
  var self = this;
  self.init();
};

/**
 * Perform init functions to setup of the notern client
 */
Notern.prototype.init = function() {
  var self = this;
  self.compileTemplates();

  // Get a new NoteController
  self.noteController = new NoteController({useLocalStorage: true});

  // Add event listeners
  self.initEventlisteners();

  // Load the notes
  // NOTE: Initializing the notes has to happen 
  // AFTER the event listeners have been added!
  // Otherwise the existing notes are not added.
  self.noteController.initNotes();

	if (!self.isLoggedIn())
		self.showPopup();
	else
		self.hidePopup();
};


function textAreaAdjust(o) {
    o.style.height = "1px";
    o.style.height = (10+o.scrollHeight)+"px";
};


/*
 * returns whether or not the user is currently logged in
 */
Notern.prototype.isLoggedIn = function() {
  var self = this;
  var username = self.noteController.getUsernameFromLocalStorage();
  return (username != null && username != "");
}



/*
 * logs the user in by sending the credentials to the server
 */
Notern.prototype.login = function(username, password, succCallback, errCallback) {
	var self = this;
	self.noteController.setUserName(username);
	$.ajax({
		url: "/login",
		type: "post",
		data: {username:username, password:password},
		success: succCallback,
		error: errCallback
	});
}

/*
 * logs the user out of the system, by sendina  request to the server
 */
Notern.prototype.logout = function() {
	var self = this;
	self.noteController.setUserName("");
	$.get("/logout");
}

/*
 * signs the user in to the system by sending a request to the server with the credentials given
 */
Notern.prototype.signup = function(username, password, email, callback) {
	var self = this;
	self.noteController.setUserName(username);
	$.post("/signup", {username: username, password:password, email:email}, callback);
}

/*
 * hides the signup/login popup
 */
Notern.prototype.hidePopup = function() {
	$("#popup").hide();
}

/*
 * hides the main website and only shows the login/signup popup
 */
Notern.prototype.showPopup = function() {
	var self = this;
	var hidePopupShowRest = function() {
		self.hidePopup();
		$("#main").show();
	};
	$("#main").hide();
	$("#signup-button").click(function() {
		self.signup($("#signup-username").val(),$("#signup-password").val(), $("#signup-email").val(),
		function(response) {
			if (response == "")
				hidePopupShowRest()
			else if (response == "in-use")
				$("#signup-username").addClass("error");
		});
	});
	$("#login-button").click(function() {
		self.login($("#login-username").val(), $("#login-password").val(), function(response) {
			if (response != "failed") {
				hidePopupShowRest();
        self.noteController.getLatestNotesFromServer();
      } else {
				$("#login-username").addClass("error");
				$("#login-password").addClass("error");
			}
		}, function() {
			$("#login-username").addClass("error");
			$("#login-password").addClass("error");
		});
	});
}

/**
 * Setting up the required event listeners for the application
 * @void
 */
Notern.prototype.initEventlisteners = function() {
  var self = this;
  // Listen for the user submitting new notes
  $("#addNoteButton").click(function() {
    var noteText = $("#notetext").val();
    $("#notetext").val("");
    var note = self.noteController.newNote({
      content: noteText,
      geo: self.geoData
    });
    self.noteController.save(note);

    return false;
  });
  // Listen to new notes being added
  $(self.noteController).bind('addedNewNote', function(event, note) {
    self.renderNote(note);
    $(note).bind('noteDestroyed', function(event) {
      var theNote = event.currentTarget;
      self.destroyNote(theNote);
    });
    // TODO: Listen to note change and rerender it
  });
  $("#sortByTime").click(function() {
    $("#sortByTime").addClass("active");
    $("#sortByLocation").removeClass("active");
    var notes = self.noteController.getAllSortedByTime();
    self.renderNotes(notes);
  });
  $("#sortByLocation").click(function() {
    $("#sortByLocation").addClass("active");
    $("#sortByTime").removeClass("active");
    var notes = self.noteController.getAllSortedByDistance();
    self.renderNotes(notes);
  });
};

/**
 * Compile the tempaltes needed for the frontend
 * @void
 */
Notern.prototype.compileTemplates = function() {
  var self = this;
  self.noteTemplate = self.compileNotesDirective();
};


/**
 * Removes a given note from the Dom
 * @void
 */
Notern.prototype.destroyNote = function(note) {
  $("#" + note.noteId()).fadeOut(500, function(dom) {
    $(dom).remove();
  });
};


/**
 * Renders a list of notes after having cleared all the notes already
 * in the dom.
 * @params
 *  notes : list of notes to be rendered
 * @void
 */
Notern.prototype.renderNotes = function(notes) {
  var self = this;
  $("#notes").html("");
  _.each(notes, function(note) {
    self.renderNote(note);
  });
};


/**
 * Renders a particular note.
 * If it has previously been rendered in the DOM,
 * then it will be replaced. If not it is added to the
 * top of the list of notes
 * @void
 */
Notern.prototype.renderNote = function(note) {
  var self = this;
  var noteJson = note.data;
  noteJson.metadata = note.metadata();
  var noteId = note.noteId();
  // Check if there is an existing rendered version of this node
  // and then replace it.
  var renderedNote = self.noteTemplate(noteJson);
  $("#notes").prepend(renderedNote);
  $("#" + noteId + " div.deleteNote a").click(function() {
    self.noteController.destroy(note);
  });
  $("#" + noteId).slideDown('slow');
};


/**
 * Compile PURE directives for notes
 * @returns
 *    the compiled notes template
 */
Notern.prototype.compileNotesDirective = function() {
	var notesDirectives = {
    "div.note@id":'noteId',
    "div div div.metadata div.stats":'metadata',
    "div div div.metadata div.deleteNote a@data-id":'noteId',
    "div div div.content":'content'
	};
	return $p("div#templates div.notes").compile(notesDirectives);
};
