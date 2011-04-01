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
 * Find distance between note's location and the supplied location.
 * @params
 *  location HTML5 position we wish to find distance to.
 *  radius Radius of the planet we're interested in (defaults to Earth).
 * @returns
 *   distance in kilometres between the note's and the supplied location,
 *            or ZERO if location is undefined.
 */
Note.prototype.distanceTo = function(location, radius) {
  // Adapted from http://www.movable-type.co.uk/scripts/latlong.html
  
  if (typeof(location) == 'undefined') return 0;
  if (typeof(radius) == 'undefined') radius = 6371;  // earth's radius (km)

  var radians = function(degrees) {
    return degrees * Math.PI / 180;
  }

  var fromLat = radians(this.data.geo.lat);
  var fromLon = radians(this.data.geo.lon);
  var toLat = radians(location.coords.latitude);
  var toLon = radians(location.coords.longitude);
  
  var dLat = toLat - fromLat;
  var dLon = toLon - fromLon;

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(fromLat) * Math.cos(toLat) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = radius * c;

  return d;
}


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
