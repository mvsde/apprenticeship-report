'use strict';



// NODE MODULES
// =============================================================================

var cover = require('../data/cover.js');




// CREATE FORM
// =============================================================================

var createForm = function() {
  var coverDB = cover.load();

  // HTML frame
  var holder = '<form class="form form--group" action="/save-cover" method="post">';

  for (var key in coverDB) {
    if (coverDB.hasOwnProperty(key)) {
      var coverDBItem = coverDB[key];

      // Heading
      if (coverDBItem.category === 'heading') {
        holder += '<' + coverDBItem.type + ' class="form-group__item form-group__item--100">' + coverDBItem.content + '</' + coverDBItem.type + '>';

      // Input
    } else if (coverDBItem.category === 'input') {
        holder += '<label class="form-input form-group__item form-group__item--' + coverDBItem.width + '">' + coverDBItem.label + '\
          <span class="form-input__note">' + coverDBItem.description + '</span>\
          <input type="' + coverDBItem.type + '" name="' + key + '" class="form-input__field" value="' + coverDBItem.value + '">\
        </label>'
      }
    }
  }

  // HTML frame
  holder += '\
    <div class="form-group__item form-group__item--100">\
      <button>Speichern</button>\
    </div>\
  </form>';

  return holder;
};




// MODULE EXPORT
// =============================================================================

module.exports = {
  title: 'Cover',
  subtitle: 'Cover mit Informationen über den Auszubildenden',
  content: createForm(),
  backURL: '/'
};
