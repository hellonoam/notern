require.paths.unshift(__dirname + "/test");
require.paths.unshift(__dirname + "/lib");
require.paths.unshift(__dirname + "/vendor");

// Unit tests
require('DbControllerTest.js');