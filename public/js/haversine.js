// Adapted from http://www.movable-type.co.uk/scripts/latlong.html

/**
 * Creates a point on the earth's surface at the supplied latitude / longitude
 *
 * @constructor
 * @param {Number} lat: latitude in numeric degrees
 * @param {Number} lon: longitude in numeric degrees
 * @param {Number} [rad=6371]: radius of earth if different value is required from standard 6,371km
 */
function Location(lat, lon, rad) {
  if (typeof(rad) == 'undefined') rad = 6371;  // earth's mean radius in km
  
  this.lat = typeof(lat)=='number' ? lat : typeof(lat)=='string' && lat.trim()!='' ? +lat : NaN;
  this.lon = typeof(lat)=='number' ? lon : typeof(lon)=='string' && lon.trim()!='' ? +lon : NaN;
  this.radius = typeof(rad)=='number' ? rad : typeof(rad)=='string' && trim(lon)!='' ? +rad : NaN;
}

/**
 * Returns the distance from this point to the supplied point, in km 
 * (using Haversine formula)
 *
 * from: Haversine formula - R. W. Sinnott, "Virtues of the Haversine",
 *       Sky and Telescope, vol 68, no 2, 1984
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @param   {Number} [precision=4]: no of significant digits to use for returned value
 * @returns {Number} Distance in km between this point and destination point
 */
Location.prototype.distanceTo = function(point) {
  
  var R = this.radius;
  var lat1 = this.lat.toRad(), lon1 = this.lon.toRad();
  var lat2 = point.lat.toRad(), lon2 = point.lon.toRad();
  var dLat = lat2 - lat1;
  var dLon = lon2 - lon1;

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1) * Math.cos(lat2) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}