const fs = require('fs');
const paths = require('./paths.js');

module.exports = {
  // Load cover
  get: function() {
    return JSON.parse(fs.readFileSync(paths.cover));
  },

  // Export cover to JSON format
  export: function() {
    return JSON.stringify(this.entries, null, 2);
  }
};
