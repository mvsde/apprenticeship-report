'use strict';



// NODE MODULES
// =============================================================================

const fs = require('fs');
const paths = require('./paths.js');




// COVER LOGIC
// =============================================================================

module.exports = {
  // Load cover
  load: function() {
    return JSON.parse(fs.readFileSync(paths.cover));
  },

  // Update cover
  update: function(data, formOnly) {
    var coverDB = this.load();

    // Update form
    if (formOnly) {
      for (var key in data) {
        if (coverDB.hasOwnProperty(key)) {
          coverDB[key].value = data[key];
        }
      }

    // Update all
    } else {
      for (var key in data) {
        if (coverDB.hasOwnProperty(key)) {
          coverDB[key] = data[key];
        }
      }
    }

    return coverDB;
  },

  // Save cover
  save: function(coverDB, errorCallback) {
    fs.writeFile(paths.cover, JSON.stringify(coverDB, null, 2), function(error) {
      if (error) {
        return errorCallback('error', error);
      }
      errorCallback('success', 'Test');
    });
  }
};
