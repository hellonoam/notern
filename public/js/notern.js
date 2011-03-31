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
  self.noteTemplate = self.compileNotesDirective();
  // Add a listener for new notes
  $("#newnoteform").submit(function() {
    var note = new Note({content: $("#notetext").val(), metadata: "random metadata"});
    note.save();
    self.renderNote(note);
    return false;
  });
};


/**
 * Render all notes.
 * Clears all preexisting notes in the view and
 * renders all the notes in the system
 * @void
 */
Notern.prototype.renderAllNotes = function() {
  var self = this;
  var allNotes = noteController.getAll();
  _.each(allNotes, function(note) { self.renderNote(note); });
}


/**
 * Renders a particular note.
 * If it has previously been rendered in the DOM,
 * then it will be replaced. If not it is added to the
 * bottom of the list of notes
 * @void
 */
Notern.prototype.renderNote = function(note) {
  var self = this;
  var noteId = note.noteId;
  // Check if there is an existing rendered version of this node
  // and then replace it.
  var renderedNote = self.noteTemplate(note);
  $("#main").append(renderedNote);
};


/**
 * Compile PURE directives for notes
 * @returns
 *    the compiled notes template
 */
Notern.prototype.compileNotesDirective = function() {
	var notesDirectives = {
    "div.metadata":'metadata',
    "div.content":'content'
	};
	return $p("div#templates div.note").compile(notesDirectives);
};
