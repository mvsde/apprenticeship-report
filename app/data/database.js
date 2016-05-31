'use strict';



// NODE MODULES
// =============================================================================

const fs    = require('fs');
const paths = require('./paths.js');




// DATABASE LOGIC
// =============================================================================

module.exports = {
  // Load and sort database
  load: function() {
    var database = JSON.parse(fs.readFileSync(paths.database));
    database.sort(function(a, b) {
      var dateA = new Date(a.start);
      var dateB = new Date(b.start);
      return dateA - dateB;
    });

    return database;
  },

  // Update database
  update: function(data) {

  },

  // Save database
  save: function() {

  }
};
