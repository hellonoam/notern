/**
 * Constructor for notes
 * Checks the server for newer versions of the notes
 */
function NoteController(config) {
  var self = this;

  // Get settings
  self.settings = {};
  if (!!config) {
    self.settings["useLocalStorage"] = !!config.useLocalStorage;
  } else {
    // Default to not using local storage if not defined otherwise
    self.settings["useLocalStorage"] = false;
  };
};


/**
 * Loads all notes from the local store into
 * memory. If local store is not supported,
 * they are loaded from the server.
 * @void
 */
NoteController.prototype.initNotes = function() {
  var self = this;
  self.notes = {};
  self.loadNotesFromLocalStore();
  self.getLatestNotesFromServer();
};


/**
 * Returns all notes for the current user
 * @returns:
 *   List of all notes
 */
NoteController.prototype.getAllSortedByTime = function() {
  var self = this;
  return _.sortBy(_.values(self.notes), function(note) { note.createdAt(); });
};


/**
 * Adds one or more notes to the local store.
 * @events
 *  newNote : for new notes not previously in the store
 * @void
 */
NoteController.prototype.addNotes = function(notes) {
  var self = this;
  var hasNewNotes = false;
  _.each(notes, function(note) {
    // Does the local store contain this note?
    if (!self.notes[note.noteId()]) {
      // The note is new so we need to 
      $(self).trigger('addedNewNote', [note]);
    };
    self.notes[note.noteId()] = note;
    hasNewNotes = true;

    // Listen to the note destroying itself
    $(note).bind('destroy', function(event) {
      var theNote = event.currentTarget;
      self.notes[theNote.noteId()] = null;
      self.persistNotesToLocalStorage();
    });
  });
  if (hasNewNotes) {
    self.persistNotesToLocalStorage();
  };
};


/**
 * Convenience method for adding a single note
 * @params
 *  note : the note to be added
 * @void
 */
NoteController.prototype.addNote = function(note) {
  var self = this;
  self.addNotes([note]);
};


/**
 * Loads all locally stored notes and inserts them
 * into the local notes object.
 * @void
 */
NoteController.prototype.loadNotesFromLocalStore = function() {
  var self = this;
  if (self.hasLocalStorage) {
    var localNotesData = self.readFromLocalStorage("notes");
    var localNotes = _.map(localNotesData, function(data) {return new Note(data);});
    if (localNotes != null) {
      // We start by sorting notes by time when they are loaded
      // from the local storagne
      var notesSortedByTime =
          _.sortBy(_.values(localNotes), function(note) { note.createdAt(); });
      self.addNotes(notesSortedByTime);
    } 
  }
};


/**
 * Persists the notes to local storage if local storage is 
 * available
 * @void
 */
NoteController.prototype.persistNotesToLocalStorage = function() {
  var self = this;
  if (self.hasLocalStorage) {
    var localNotesData = _.map(_.values(self.notes), function(note) { return note.data; });
    self.writeToLocalStorage("notes", localNotesData);
  }
};


/**
 * Gets all notes from the server that we don't yet have locally
 * @void
 */
NoteController.prototype.getLatestNotesFromServer = function() {
  var self = this;
  var url = "/user/sebastian/notes";
  if (self.hasLocalStorage) {
    var lastModified = self.lastModified();
    if (lastModified != 0) {
      url = url + '?since=' + lastModified;
    };
  };
  $.getJSON(url, function(notesJson) {
    // These notes are from the server.
    // We should set the last modified flag accordingly
    // so that we know when the last note we received from the
    // server was from.
    var notes = _.map(notesJson, function(noteJson) {
      return new Note(noteJson);
    });
    _.each(notes, function(note) {
      self.setLastModifiedIfGreater(note.lastModified()); 
    });
    // Add the notes to the local storage.
    // This also prompts them to be displayed
    self.addNotes(notes);
  });
};


/**
 * Returns a new note object that the note controller
 * has registered to handle events for
 * @params:
 *  JSON values for the note
 * @returns
 *  new note
 */
NoteController.prototype.newNote = function(noteJson) {
  var self = this;
  var newNote = new Note(noteJson);
  $(newNote).bind('noteAdded', function(event) {
    console.log("Controller got notified about note being saved");
    var theNote = event.currentTarget;
    self.addNote(theNote);
  });
//  $(newNote).bind('serverSaveFailed', function(event) {
//    var theNote = event.currentTarget;
//    console.log("Controller got notified about note not being save to server");
//    // TODO: Add to list of notes that are saved
//  });
  return newNote;
};

/**
 * Convenience method for getting the timestamp for
 * the latest change seen from the server.
 * @returns
 *  timestamp as int. Number of seconds since epoch
 */
NoteController.prototype.lastModified = function() {
  var lastModified = this.readFromLocalStorage("lastModified");
  return lastModified == null ? 0 : lastModified;
};


/**
 * Convenience method for setting when the last
 * note we received from the server was updated
 * @params
 *  time : timestamp as int. Number of seconds since epoch
 * @void
 */
NoteController.prototype.setLastModifiedIfGreater = function(time) {
  var self = this;
  var previousLastModified = self.lastModified();
  if (previousLastModified < time) {
    this.writeToLocalStorage("lastModified", time);
  };
};


/**
 * Writes a key value pair to the datastore.
 * The data is serialized before being stored
 * @params
 *  key : key to store the value under
 *  value : the data to be stored
 * @void
 */
NoteController.prototype.writeToLocalStorage = function(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
};


/**
 * Returns the value of a key from the datastore,
 * deserializing it before it is returned.
 * @params
 *  key : the key under which the data item is stored
 * @returns
 *  data : the data stored under the key. Potentially null
 */
NoteController.prototype.readFromLocalStorage = function(key) {
  return JSON.parse(localStorage.getItem(key));
};


/**
 * Convenience method to clear the database
 * @void
 */
NoteController.prototype.emptyDatabase = function() {
  localStorage.clear();
};


/**
 * Returns true if local storage is supported, false otherwise
 */
NoteController.prototype.hasLocalStorage = function() {
  var self = this;
  try {
    return 'localStorage' in window 
      && window['localStorage'] !== null 
      && self.settings["useLocalStorage"];
  } catch (e) {
    return false;
  }
};
