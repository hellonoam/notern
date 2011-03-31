/**
 * Constructor for notes
 * Checks the server for newer versions of the notes
 */
function NoteController() {
  console.log("init called");
  var self = this;
  self.updateDataStore();
};


/**
 * Returns true if local storage is supported, false otherwise
 */
NoteController.prototype.hasLocalStorage = function() {
  console.log("has local storage called");
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
};


/**
 * Returns a note object for a particular noteId
 * @params:
 *   noteId : the noteId of the note
 * @returns:
 *   the note for the noteId or null if none exist
 */
NoteController.prototype.get = function(noteId) {
  var self = this;
  var note = self.getNoteFromLocalStore(noteId);
  if (note == null) {
    return self.getNoteFromServer(noteId);
  };
};


/**
 * Returns a note object for a particular noteId
 * @params:
 *   noteId : the noteId of the note
 * @returns:
 *   List of all notes
 */
NoteController.prototype.getAll = function(noteId) {
  return null;
};


/**
 * loads a note from the server
 * @params
 *    noteId : noteId of node to load
 */
NoteController.prototype.getNoteFromServer = function(noteId) {
  var self = this;
  $.getJSON("user/sebastian/notes/" + noteId, function(data) {
    self.addToLocalStore(data);
    return new Node(data);
  });
};


/**
 * Persists a note in the local datastore
 * overwriting existing notes if one is already existing
 * @params
 *    data : the note data object also containing its own noteId as data.noteId
 */
NoteController.prototype.addToLocalStore = function(data) {
  var self = this;
  console.log(data);
  if (self.hasLocalStorage) {
    // Make sure the local store knows when the last modified item
    // was modified
    var lastModified = self.lastModified();
    if (lastModified < data.lastModified) {
      self.writeToLocalStorage("lastModified", data.lastModified);
    };
    // Save the data to the local store
    var noteId = data.noteId;
    self.writeToLocalStorage(noteId, data);
    // Get a collection of noteIds
    var allNoteIds = self.allNoteIds();
    // create initial noteIdmap
    if (allNoteIds == null) {allNoteIds = [];};
    // insert noteId if it isn't already there
    if (allNoteIds.indexOf(noteId) == -1) {
      console.log("allNoteIds before push: " + allNoteIds);
      allNoteIds.push(noteId);
      self.setAllNoteIds(allNoteIds);
    };
  };
};


/**
 * Loads a note from the local store given a noteId
 * @params
 *    noteId : the noteId to load the note from
 * @returns
 *    note or null if no note is known by that noteId
 */
NoteController.prototype.getNoteFromLocalStore = function(noteId) {
  if (self.hasLocalStorage) {
    return self.readFromLocalStorage(noteId);
  } else {
    return null;
  };
};


/**
 * Loads a note from the local store given a noteId
 * @params
 *    noteId : the noteId to load the note from
 * @returns
 *    note or null if no note is known by that noteId
 */
NoteController.prototype.removeFromLocalStore = function(noteId) {
  if (self.hasLocalStorage) {
    // Remove the note
    writeToLocalStorage(noteId, null);

    var allNoteIds = self.allNoteIds();
    writeToLocalStorage("allNoteIds", allNoteIds.without(noteId));
  };
};


/**
 * Ensures that the local datastore
 * has the most up to date versions of the notes
 * @void
 */
NoteController.prototype.updateDataStore = function() {
  var self = this;
  if (self.hasLocalStorage) {
    var url = "/user/sebastian/notes";
    var lastModified = self.lastModified();
    if (lastModified != null) {
      url = url + '?since=' + lastModified;
    };
    $.getJSON(url, function(notes) {
      _.each(notes, function(note) {
        self.addToLocalStore(note);
      });
    });
  };
};


NoteController.prototype.lastModified = function() {
  return this.readFromLocalStorage("lastModified");
};
NoteController.prototype.setLastModified = function(time) {
  this.writeToLocalStorage("lastModified", time);
};
NoteController.prototype.allNoteIds = function() {
  return this.readFromLocalStorage("allNoteIds");
};
NoteController.prototype.setAllNoteIds = function(noteIds) {
  this.writeToLocalStorage("allNoteIds", noteIds);
};

NoteController.prototype.writeToLocalStorage = function(key, value) {
  localStorage[key] = JSON.stringify(value);
};
NoteController.prototype.readFromLocalStorage = function(key) {
  return JSON.parse(localStorage[key]);
};


NoteController.prototype.emptyDatabase = function() {
  localStorage["allNoteIds"] = null;
  localStorage["lastModified"] = null;
};


// Instance to be used throughout the code
var noteController = new NoteController();
