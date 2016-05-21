const fs = require('fs');
const paths = require('./paths.js');

module.exports = {
  // Load cover
  load: function() {
    return JSON.parse(fs.readFileSync(paths.cover));
  },

  // Update cover
  update: function(data, type) {
    var coverDB = this.load();

    // Update form
    if (type === 'form') {
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
  save: function(data) {
    fs.writeFile(paths.cover, JSON.stringify(data, null, 2), function(error) {
      if (error) {
        console.error(error);
        return error;
      } else {
        console.log('Success!');
        return "Success";
      }
    });
  }
};
