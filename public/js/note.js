/**
 * Constructor for notes
 * Checks the server for newer versions of the nodes
 */
function Note(data) {
  var self = this;
  
  // Set initial values
  self.data = typeof(data) != 'undefined' ? data : {};
  self.data.createdAt = new Date().getTime();
  if (self.data.noteId == null) {
    var noteId = Sha1.hash(JSON.stringify(self));
    self.data.noteId = noteId;
  };
};


/**
 * Saves a node to the local datastore
 * and to the server.
 * @returns:
 *    an array of notes
 */
Note.prototype.destroy = function() {
  var self = this;
  // TODO: Add a method for catching errors and destroy later
  // when online again!
  $.ajax({
    type: 'DELETE',
    url: '/user/sebastian/notes/' + self.data.noteId,
    error: function() {
      self.data["pendingDelete"] = true;
      console.log("Failed at deleting node... will retry");
      $(self).trigger('serverDeleteFailed');
    },
    success: function() {
      $(self).trigger('destroySuccessful');
      console.log("Note successfully destroyed at server...");
    }
  });
  // Let observers know that the note destroyed itself
  $(self).trigger('noteDestroyed');
};


/**
 * Destroys a particular note
 * @void
 */
Note.prototype.save = function() {
  var self = this;
  console.log("is this note new? " + self.isNew() + ", what is last saved? " + self.data.lastSaved);
  console.log(self);
  // TODO: Add some state that indicates if a note has been saved
  // or not that can be shown to the user

  // If it is a new object, set the createdAt time
  var METHOD = "";
  var serverUrl = "/user/sebastian/notes/";
  if (self.isNew()) {
    // This is a new note, so it should be created with POST
    METHOD = "POST";
  } else {
    METHOD = "PUT";
    serverUrl = serverUrl + self.noteId();
  };
  // The note is changed, so update the last modified time
  self.data.lastModified = new Date().getTime();

  $.ajax({
    type: METHOD,
    url: serverUrl,
    data: self.data,
    success: function(data) { 
      console.log("note was saved"); 
      self.data.lastSaved = new Date().getTime();
      $(self).trigger('noteSaved');
      self.rerenderNote();
    },
    error: function(data) { 
      console.log("note saving FAILED. handle"); 
      $(self).trigger('serverSaveFailed');
    }
  });

  $(self).trigger('noteAdded');
};


/**
 * Getter for the note id
 * @returns 
 *    the notes unique id
 */
Note.prototype.noteId = function() {
  return this.data.noteId;
};


/**
 * Asks for the note to be rerendered
 * @void
 */
Note.prototype.rerenderNote = function() {
  var self = this;
  $(self).trigger('rerenderNote');
};


/**
 * Getter fro the creation time
 * @returns
 *  number of seconds between epoch and time of creation
 */
Note.prototype.createdAt = function() {
  var self = this;
  self.data.createdAt;
};


/**
 * Whether or not the note has ever been saved
 * @returns
 *  boolean true if has unsaved changes
 */
Note.prototype.isNew = function() {
  var self = this;
  console.log(self.data.lastSaved);
  return self.data.lastSaved == undefined;
};


/**
 * Whether or not the note has unsaved changes
 * @returns
 *  boolean true if has unsaved changes
 */
Note.prototype.isUnsaved = function() {
  var self = this;
  return self.data.lastSaved < self.data.lastModified;
};


/**
 * Getter fro the creation time
 * @returns
 *  number of seconds between epoch and time of creation
 */
Note.prototype.lastModified = function() {
  var self = this;
  self.data.lastModified;
};


/**
 * Returns true if the note is pending delete
 * @returns
 *  true if the note is pending delete.
 */
Note.prototype.isPendingDelete = function() {
  var self = this;
  return !_.isUndefined(self.data["pendingDelete"]);
};
