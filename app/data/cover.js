const fs = require('fs');
const paths = require('./paths.js');

module.exports = {
  // Cover holder variable
  entries: {},

  // Load cover
  load: function() {
    this.entries = JSON.parse(fs.readFileSync(paths.cover));
  },

  // Export cover to JSON format
  export: function() {
    return JSON.stringify(this.entries, null, 2);
  }
};
