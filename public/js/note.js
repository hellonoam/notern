/**
 * Constructor for notes
 * Checks the server for newer versions of the nodes
 */
function Note() {
  var self = this;

  // Set initial default values
  self.key = null;
  self.lastModified = new Date().getTime();
};


/**
 * Saves a node to the local datastore
 * and to the server.
 * @returns:
 *    an array of notes
 */
Note.prototype.destroy = function() {
  $.ajax({
    type: 'DELETE',
    url: '/user/sebastian/notes/' + self.key,
    success: self.postDestroyHook
  });
};


/**
 * Destroys a particular note
 * @void
 */
Note.prototype.save = function() {
  var self = this;
  if (self.key == null) {
    // This is a new item, create it
    var noteData = JSON.stringify(self);
    console.log("stringified note: " + noteData);
    $.post("/user/sebastian/notes", self, self.postCreateUpdateHook, "application/json");
  } else {
    // This is an existing item, update it
    var key = self.key;
    $.put('/user/sebastian/notes/' + key, self, self.postCreateUpdateHook, "application/json");
  };
};


/**
 * This method is called after a the server has received an updated note.
 * It tells the NodeController to update its local store accordingly.
 * @void
 */
Note.prototype.postCreateUpdateHook = function(noteData) {
  NoteController.addToLocalStore(noteData);
};


/**
 * This method is called after a node has been deleted.
 * It removes it from the local 
 * It tells the NodeController to update its local store accordingly.
 * @void
 */
Note.prototype.postDestroyHook = function(noteData) {
  NoteController.removeFromLocalStore(noteData.key);
};
