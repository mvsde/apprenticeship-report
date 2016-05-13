const cover = require('../data/cover.js');

var createForm = function() {
  var coverData = cover.get();
  var holder = '<form class="form" action="/config-saved" method="post">';

  for (var key in coverData) {
    if (coverData.hasOwnProperty(key)) {
      if (coverData[key].heading) {
        holder += coverData[key].heading;
      }

      holder += '<label class="form-input ' + coverData[key].classes + '">' + coverData[key].label + '\
        <span class="form-input__note">' + coverData[key].description + '</span>\
        <input type="' + coverData[key].type + '" name="' + key + '" class="form-input__field" value="' + coverData[key].value + '">\
      </label>'
    }
  }

  holder += '<button>Speichern</button></form>';

  return holder;
};

module.exports = {
  title: 'Cover',
  header: '<h1>Cover</h1><p class="subtitle">Cover mit Informationen über den Auszubildenden.</p>',
  content: createForm()
};
