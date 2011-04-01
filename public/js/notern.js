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
  console.log("in init");
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
};


Notern.prototype.login = function(username, password) {
	var self = this;
	self.noteController.setUserName(username);
	$.post("/login", {username: username, password:password});
}

Notern.prototype.logout = function() {
	var self = this;
	self.noteController.setUserName("");
	$.get("/logout");
}

Notern.prototype.signup = function(username, password, email) {
	var self = this;
	self.noteController.setUserName(username);
	$.post("/signup", {username:username, password:password, email:email});
}


/**
 * Setting up the required event listeners for the application
 * @void
 */
Notern.prototype.initEventlisteners = function() {
  console.log("add init event listener");
  var self = this;
  // Listen for the user submitting new notes
  $("#addNoteButton").click(function() {
    console.log("in the submit listener");
    var note = self.noteController.newNote({
      content: $("#notetext").val(), 
      metadata: "random metadata",
      geo: self.geoData
    });
    self.noteController.save(note);
    return false;
  });
  // Listen to new notes being added
  $(self.noteController).bind('addedNewNote', function(event, note) {
    console.log("received new note to render: " + note.noteId());
    self.renderNote(note);
    $(note).bind('noteDestroyed', function(event) {
      console.log("notern was informed that node was destroyed");
      var theNote = event.currentTarget;
      self.destroyNote(theNote);
    });
    // TODO: Listen to note change and rerender it
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
 * Renders a particular note.
 * If it has previously been rendered in the DOM,
 * then it will be replaced. If not it is added to the
 * bottom of the list of notes
 * @void
 */
Notern.prototype.destroyNote = function(note) {
  $("#" + note.noteId()).fadeOut(500, function(dom) {
    $(dom).remove();
  });
};


/**
 * Renders a particular note.
 * If it has previously been rendered in the DOM,
 * then it will be replaced. If not it is added to the
 * bottom of the list of notes
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
