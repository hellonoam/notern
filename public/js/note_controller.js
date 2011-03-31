/**
 * Constructor for notes
 * Checks the server for newer versions of the nodes
 */
function NoteController() {
  var self = this;
};


/**
 * Returns true if local storage is supported, false otherwise
 */
NoteController.hasLocalStorage = function() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
};


/**
 * Returns a note object for a particular key
 * @params:
 *   key : the key of the note
 * @returns:
 *   the note for the key or null if none exist
 */
NoteController.get = function(key) {
  var note = NoteController.getNoteFromLocalStore(key);
  if (note == null) {
    return NoteController.getNoteFromServer(key);
  };
};


/**
 * Returns a note object for a particular key
 * @params:
 *   key : the key of the note
 * @returns:
 *   List of all notes
 */
NoteController.getAll = function(key) {
  return null;
};


/**
 * loads a note from the server
 * @params
 *    key : key of node to load
 */
NoteController.getNoteFromServer = function(key) {
  $.getJSON("user/sebastian/notes/" + key, function(data) {
    NoteController.addToLocalStore(data);
    return data;
  });
};


/**
 * Persists a note in the local datastore
 * overwriting existing notes if one is already existing
 * @params
 *    data : the note data object also containing its own key as data.key
 */
NoteController.addToLocalStore = function(data) {
  console.log("addToLocalStore called with data: " + data);
  if (NoteController.hasLocalStorage) {
    // Save the data to the local store
    var key = data.key;
    localStorage[key] = JSON.stringify(data);

    var keyMap = localStorage["keyMap"];
    // create initial keymap
    if (keyMap == null) {keyMap = {};};
    // create a mapping
    keyMap[key] = data.lastModified;
    localStorage["keyMap"] = keyMap;
  };
};


/**
 * Loads a note from the local store given a key
 * @params
 *    key : the key to load the note from
 * @returns
 *    note or null if no note is known by that key
 */
NoteController.getNoteFromLocalStore = function(key) {
  if (NoteController.hasLocalStorage) {
    return JSON.parse(localStorage[key]);
  } else {
    return null;
  };
};


/**
 * Loads a note from the local store given a key
 * @params
 *    key : the key to load the note from
 * @returns
 *    note or null if no note is known by that key
 */
NoteController.removeFromLocalStore = function(key) {
  if (NoteController.hasLocalStorage) {
    // Remove the note
    localStorage[key] = null;

    var keyMap = localStorage["keyMap"];
    keyMap[key] = null;
    localStorage["keyMap"] = keyMap;
  };
};
