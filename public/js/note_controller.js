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

  self.userName = self.getUsernameFromLocalStorage();

  if (navigator.geolocation) {
    self.geocoder = new google.maps.Geocoder();
    self.locationWatch =
        navigator.geolocation.watchPosition(
            self.updateUserLocation(self),
            function(error) {
				console.log(error);
                // Don't freak out... yet
            }
    );
  } else {
    mpmetrics.track("No geolocation");
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
  self.performOfflineActions();
  setInterval(function() {
    self.performOfflineActions();
  }, 30000);
};


/**
 * Updates the user's stored location.
 * @param location The new location.
 */
NoteController.prototype.updateUserLocation = function(controller) {
    return function(location) {
        controller.location = location;
        var latlng = new google.maps.LatLng(
            location.coords.latitude, location.coords.longitude);
            
        controller.geocoder.geocode(
            {'latLng': latlng},
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0])
                        controller.locationName = results[0].formatted_address;
                }
            });
    };
};


/**
 * Returns all notes for the current user sorted by increasing distance from
 * the users current location
 * @returns:
 *   List of all notes sorted by distance
 */
NoteController.prototype.getAllSortedByDistance = function() {
  var self = this;
  return _.sortBy(self.validNotes(),
                  function(note) { return note.distanceTo(self.location); }).reverse();
};


/**
 * Returns all notes for the current user
 * @returns:
 *   List of all notes
 */
NoteController.prototype.getAllSortedByTime = function() {
  var self = this;
  return _.sortBy(self.validNotes(), function(note) { return note.createdAt(); });
};


/**
 * Returns all notes that can be displayed.
 * Notes pending delete are removed.
 * @returns
 *  a list of notes that can be displayed in the interface
 */
NoteController.prototype.validNotes = function() {
  var self = this;
  var notes = _.values(self.notes);
  var validNotes = _.filter(notes, function(note) { return !note.isPendingDelete(); });
  return validNotes;
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
    } 
    self.notes[note.noteId()] = note;
    hasNewNotes = true;
    // Listen to the note destroying itself
    $(note).bind('destroySuccessful', function(event) {
      var theNote = event.currentTarget;
      delete self.notes[theNote.noteId()];
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
    var localNotes = _.map(localNotesData, function(data) {return self.newNote(data);});
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
  var url = "/user/" + self.userName + "/notes";
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
      return self.newNote(noteJson);
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
 * Destroys a particular note
 * @void
 */
NoteController.prototype.save = function(note) {
  var self = this;

  // If it is a new object, set the createdAt time
  var METHOD = "";
  var serverUrl = "/user/" + self.userName + "/notes/";
  if (note.isNew()) {
    // This is a new note, so it should be created with POST
    METHOD = "POST";
  } else {
    METHOD = "PUT";
    serverUrl = serverUrl + note.noteId();
  };
  // The note is changed, so update the last modified time
  note.data.lastModified = new Date().getTime();

  $.ajax({
    type: METHOD,
    url: serverUrl,
    data: note.data,
    success: function(data) { 
      note.data.lastSaved = new Date().getTime();
      $(note).trigger('noteSaved');
      note.rerenderNote();
    },
    error: function(data) { 
      $(note).trigger('serverSaveFailed');
    }
  });

  $(note).trigger('noteAdded');
};


/**
 * Removes the note from the local storage
 * and from the server.
 * @params:
 *  note : the note to destroy
 * @void
 */
NoteController.prototype.destroy = function(note) {
  var self = this;
  // TODO: Add a method for catching errors and destroy later
  // when online again!
  $.ajax({
    type: 'DELETE',
    url: '/user/' + self.userName + '/notes/' + note.noteId(),
    error: function() {
      note.data["pendingDelete"] = true;
      $(note).trigger('serverDeleteFailed');
    },
    success: function() {
      $(note).trigger('destroySuccessful');
    }
  });
  // Let observers know that the note destroyed itself
  $(note).trigger('noteDestroyed');
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
  
  // If the note doesn't have a location, add the current one.
  if (self.location && !noteJson["geo"]) {
      var coords = self.location.coords;
      var geo = {lat: coords.latitude, long: coords.longitude};
      noteJson["geo"] = geo;
      if (self.locationName) noteJson["geoName"] = self.locationName;
      // TODO: add metadata when the note is ALTERED!
  }
  
  var newNote = new Note(noteJson);
  $(newNote).bind('noteAdded', function(event) {
    var theNote = event.currentTarget;
    self.addNote(theNote);
  });
  $(newNote).bind('noteSaved', function(event) {
    var theNote = event.currentTarget;
    self.offlineActionHasBeenPerformed(theNote.noteId());
    self.persistNotesToLocalStorage();
  });
  $(newNote).bind('serverSaveFailed', function(event) {
    var theNote = event.currentTarget;
    self.registerOfflineAction({id: theNote.noteId(), action: "save"});
  });
  $(newNote).bind('destroySuccessful', function(event) {
    var theNote = event.currentTarget;
    self.offlineActionHasBeenPerformed(theNote.noteId());
  });
  $(newNote).bind('serverDeleteFailed', function(event) {
    var theNote = event.currentTarget;
    self.registerOfflineAction({id: theNote.noteId(), action: "destroy"});
  });
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
 * Performs all tasks that have been registered as offline actions
 * @void
 */
NoteController.prototype.performOfflineActions = function() {
  var self = this;
  var offlineActions = self.offlineActions();
  _.each(offlineActions, function(data) {
    var note = self.notes[data.id];
    if (note) {
      if (data.action == "save") {
        self.save(note);
      } else if (data.action == "destroy") {
        self.destroy(note);
      };
    };
  });
};


/**
 * Registers that a particular key couldn't be stored or save to the server.
 * The action will be retried
 * @params
 *  data
 *    id : key
 *    action : "save" | "destroy"
 * @void
 */
NoteController.prototype.registerOfflineAction = function(data) {
  var self = this;
  if (self.hasLocalStorage) {
    var offlineActions = self.offlineActions();
    // Find offline actions registered for the particular id
    var existingMatchingActions = _.select(offlineActions, function(actable) {
      return data.id == actable.id;
    });
    var actionsToSave = offlineActions;
    // There should never be more than one offline action per key
    if (existingMatchingActions.length > 1) {
      console.log("There are more than two existing offline actions for key:" + data.id);
    };
    if (existingMatchingActions.length > 0) {
      var existing = existingMatchingActions[0];
      if (existing.action == "save" && data.action == "destroy") {
        // We are destroying a note before it has been saved to the server.
        // The only thing we need to do is to remove it from the offline action
        // list.
        actionsToSave = _.without(actionsToSave, existing);
      }
      if (existing.action == "destroy" && data.action == "destroy") {
        // We have already requested to destroy the note, no need to
        // add a new task
      }
      if (existing.action == "destroy" && data.action == "save") {
        // This shouldn't happen. If a note has already been destroyed,
        // then the user can't edit it. We ignore the save request.
      }
      if (existing.action == "save" && data.action == "save") {
        // We already have a save request for this particular note, nothing new
        // to do. Leave the save action list as is.
      }
    } else {
      // There is no offline action for this id. Add it
      actionsToSave.push(data);
    };
    self.writeToLocalStorage("offlineActions", actionsToSave);
  }
};


/**
 * All the noteIds that haven't currently been saved to the database
 * @returns
 *  A list of all the note id's that have yet to be saved to the database
 */
NoteController.prototype.offlineActions = function() {
  var self = this;
  if (self.hasLocalStorage && self.readFromLocalStorage != null) {
    var offlineActions = self.readFromLocalStorage("offlineActions");
    return !!offlineActions ? offlineActions : [];
  }
  return [];
};


/**
 * Removes a noteId from the list of notes that have not yet been saved.
 * @void
 */
NoteController.prototype.offlineActionHasBeenPerformed = function(key) {
  var self = this;
  if (self.hasLocalStorage) {
    var offlineActions = self.offlineActions();
    // Store all the offline actions except the one for the given key
    self.writeToLocalStorage("offlineActions", _.select(offlineActions, function(data) {
      return data.id != key;
    }));
  }
};


/**
 * Removes a noteId from the list of notes that have not yet been saved.
 * @void
 */
NoteController.prototype.getUsernameFromLocalStorage = function() {
  var self = this;
  var defaultUser = "";
  if (self.hasLocalStorage) {
    var username = self.readFromLocalStorage("ownerOfData");
    if (username == null) {
      return defaultUser;
    } else {
      return username;
    };
  }
  return defaultUser;
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


/**
 * Set the name of the current logged in user
 * @param
 *  username : username that is used against the web api
 * @void
 */
NoteController.prototype.setUserName = function(username) {
  var self = this;
  self.userName = username;
  // Check if the data in the local storage is for this user
  var userForData = self.readFromLocalStorage("ownerOfData");
  if (userForData != username) {
    self.emptyDatabase();
    self.writeToLocalStorage("ownerOfData", username);
  }
};
