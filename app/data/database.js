const fs = require('fs');
const paths = require('./paths.js');

module.exports = {
  // Database holder variable
  entries: [],

  // Load and sort database
  load: function() {
    this.entries = JSON.parse(fs.readFileSync(paths.database));
    this.entries.sort(function(a, b) {
      var dateA = new Date(a.start);
      var dateB = new Date(b.start);
      return dateA - dateB;
    });
  },

  // Export database to JSON format
  export: function() {
    return JSON.stringify(this.entries, null, 2);
  }
};
