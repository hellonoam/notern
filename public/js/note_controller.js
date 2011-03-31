/**
 * Constructor for notes
 * Checks the server for newer versions of the nodes
 */
function NoteController() {
  NoteController.updateDataStore();
};


/**
 * Returns true if local storage is supported, false otherwise
 */
NoteController.hasLocalStorage = function() {
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
NoteController.get = function(noteId) {
  var note = NoteController.getNoteFromLocalStore(noteId);
  if (note == null) {
    return NoteController.getNoteFromServer(noteId);
  };
};


/**
 * Returns a note object for a particular noteId
 * @params:
 *   noteId : the noteId of the note
 * @returns:
 *   List of all notes
 */
NoteController.getAll = function(noteId) {
  return null;
};


/**
 * loads a note from the server
 * @params
 *    noteId : noteId of node to load
 */
NoteController.getNoteFromServer = function(noteId) {
  $.getJSON("user/sebastian/notes/" + noteId, function(data) {
    NoteController.addToLocalStore(data);
    return data;
  });
};


/**
 * Persists a note in the local datastore
 * overwriting existing notes if one is already existing
 * @params
 *    data : the note data object also containing its own noteId as data.noteId
 */
NoteController.addToLocalStore = function(data) {
  debugger
  console.log("addToLocalStore called with data: " + data);
  if (NoteController.hasLocalStorage) {
    // Make sure the local store knows when the last modified item
    // was modified
    var lastModified = JSON.parse(localStorage["lastModified"]);
    if (lastModified < data.lastModified) {
      localStorage["lastModified"] = JSON.stringify(data.lastModified);
    };
    // Save the data to the local store
    var noteId = data.noteId;
    localStorage[noteId] = JSON.stringify(data);
    
    // Get a collection of noteIds
    var allNoteIds = JSON.parse(localStorage["allNoteIds"]);
    // create initial noteIdmap
    if (allNoteIds == null) {allNoteIds = [];};
    // insert noteId if it isn't already there
    if (allNoteIds.indexOf(noteId) == -1) {
      console.log("allNoteIds before push: " + allNoteIds);
      allNoteIds.push(noteId);
      localStorage["allNoteIds"] = JSON.stringify(allNoteIds);
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
NoteController.getNoteFromLocalStore = function(noteId) {
  if (NoteController.hasLocalStorage) {
    return JSON.parse(localStorage[noteId]);
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
NoteController.removeFromLocalStore = function(noteId) {
  if (NoteController.hasLocalStorage) {
    // Remove the note
    localStorage[noteId] = JSON.stringify(null);

    var allNoteIds = localStorage["allNoteIds"];
    localStorage["allNoteIds"] = JSON.stringify(allNoteIds.without(noteId));
  };
};


/**
 * Ensures that the local datastore
 * has the most up to date versions of the notes
 * @void
 */
NoteController.updateDataStore = function() {
  if (NoteController.hasLocalStorage) {
    var url = "/user/sebastian/notes";
    var lastModified = JSON.parse(localStorage["lastModified"]);
    if (lastModified != null) {
      url = url + '?since=' + lastModified;
    };
    $.getJSON(url, function(notes) {
      _.each(notes, function(note) {
        NoteController.addToLocalStore(note);
      });
    });
  };
};


NoteController.emptyDatabase = function() {
  localStorage["allNoteIds"] = null;
  localStorage["lastModified"] = null;
};
