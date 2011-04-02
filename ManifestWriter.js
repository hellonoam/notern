// Rhodri Karim, rhodri@gmail.com

var fs = require('fs'),
    crypto = require('crypto');

var ignore = ['.DS_Store'];

/**
 * Returns true if the array contains the supplied object.
 */
Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}

/**
 * Returns an array of filenames rooted at the supplied directory.
 */
function enumerateFiles(directory) {
    var files = [], directories = []; 
    var contents = fs.readdirSync(directory);
    
    for (var i = 0; i < contents.length; i++) {
      var item = contents[i];
      if (ignore.contains(item)) continue;
      else {
        var stats = fs.statSync(directory + "/" + item);
        if (stats.isFile()) files.push(item);
        else if (stats.isDirectory()) directories.push(item);
      }
    }
    
    for (var d = 0; d < directories.length; d++) {
      var sub = enumerateFiles(directory + "/" + directories[d]);
      for (var s = 0; s < sub.length; s++) {
        sub[s] = directories[d] + "/" + sub[s];
      }
      files = files.concat(sub);
    }
    
    return files;
}

/**
 * Writes a CACHE MANIFEST of all files in directory to
 * directory/filename, ending with a hash of the directory contents.
 */
exports.writeManifest = function(directory, filename) {
    var h = crypto.createHash("md5");
    var w = fs.createWriteStream(directory + "/" + filename);
    
    w.write("CACHE MANIFEST\n");
    
    var files = enumerateFiles(directory);
    for (var i = 0; i < files.length; i++) {
        h.update(files[i]);
        w.write(files[i] + "\n");
    }
    
    w.write("# Version Hash:\n");
    w.write("# " + h.digest("base64") + "\n");
    
    w.end(); w.destroySoon();
}