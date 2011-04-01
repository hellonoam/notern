var assert = require('assert'),
    sqlite = require('sqlite'),
    DbController = require('DbController.js');

// Test constructor
dbc = new DbController(":memory:");
assert.ok(dbc, "Constructor produced null.");
assert.equal(dbc.path, ":memory:", "Constructor did not pass path.");

// Test executeGuarded() calls back with error for null path
nullDb = new DbController(null);
nullDb.executeGuarded(null, null, null, function(error) {
    assert.ok(error,
        "executeGuarded did not fail for an invalid path.");
});

// Test executeGuarded() performs SQL statements correctly
dbc.executeGuarded(
    "CREATE TABLE example (column)", [],
    function(rows) {
        assert.ok(rows, "No result from SQL call.");
    },
    function(error) {
        assert.ifError(error, "Database failure when creating table.");
    }
);

// Test initializeTable() creates correct tables
dbc.initializeTables(function(error) {
    assert.ifError(error);
    dbc.executeGuarded(
        "SELECT * FROM Users", [],
        function(rows) { assert.ok(rows, "No result from Users table."); },
        function(error) { assert.ifError(error, "Database failure when " +
                            "selecting from Users."); });
    dbc.executeGuarded(
        "SELECT * FROM Notes", [],
        function(rows) { assert.ok(rows, "No result from Notes table."); },
        function(error) { assert.ifError(error, "Database failure when " +
                            "selecting from Notes."); });
    dbc.executeGuarded(
        "SELECT * FROM Sessions", [],
        function(rows) { assert.ok(rows, "No result from Sessions table."); },
        function(error) { assert.ifError(error, "Database failure when " +
                            "selecting from Sessions."); });
    dbc.executeGuarded(
        "SELECT * FROM NotExist", [],
        null, function(error) { assert.ok(error, "No error when selecting from non-existent table."); });
        
    }
);