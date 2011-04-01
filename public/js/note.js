/**
 * Constructor for notes
 * Checks the server for newer versions of the nodes
 */
function Note(data) {
  var self = this;
  self.data = typeof(data) != 'undefined' ? data : {};
};


/**
 * Saves a node to the local datastore
 * and to the server.
 * @returns:
 *    an array of notes
 */
Note.prototype.destroy = function() {
  var self = this;
  // Let observers know that the note destroyed itself
  $(self).trigger('destroy');
  // TODO: Add a method for catching errors and destroy later
  // when online again!
  $.ajax({
    type: 'DELETE',
    url: '/user/sebastian/notes/' + self.data.noteId,
    success: self.postDestroyHook
  });
};


/**
 * Destroys a particular note
 * @void
 */
Note.prototype.save = function() {
  var self = this;

  // TODO: Add some state that indicates if a note has been saved
  // or not that can be shown to the user

  // If it is a new object, set the createdAt time
  var METHOD = "";
  var serverUrl = "/user/sebastian/notes/";
  if (self.noteId() == null) {
    // This is a new note, so it should be created with POST
    METHOD = "POST";
    // We also need to set initial values
    self.data.createdAt = new Date().getTime();
    var key = Sha1.hash(JSON.stringify(self));
    self.data.noteId = key;
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
 * Getter fro the creation time
 * @returns
 *  number of seconds between epoch and time of creation
 */
Note.prototype.createdAt = function() {
  var self = this;
  self.data.createdAt;
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
