'use strict';



// NODE MODULES
// =============================================================================

var cover = require('../data/cover.js');




// CREATE FORM
// =============================================================================

var createForm = function() {
  var createWorkHTML = function(index) {
    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    var html = '';

    if (work && work[index]) {
      for (var i = 0; i < work[index].tasks.length; i++) {

        // Variable that holds the remove button HTML
        var removeButton = '';

        // Don't generate remove button HTML for first entry
        if (i > 0) {
          removeButton = '<button type="button" class="form-work__button form-work__button--remove">-</button>';
        }

        html += '\
          <div class="form-group form-work__input">\
            <label class="form-input form-group__item form-group__item--80">Beschreibung\
              <input type="text" name="task-' + index + '" value="' + work[index].tasks[i] + '" class="form-input__field">\
            </label>\
            <label class="form-input form-group__item form-group__item--20">Zeit\
              <input type="number" step="0.25" name="hours-' + index + '" value="' + work[index].hours[i] + '" class="form-input__field">\
            </label>' + removeButton + '\
          </div>';
      }
    } else {
      html = '\
        <div class="form-group form-work__input">\
          <label class="form-input form-group__item form-group__item--80">Beschreibung\
            <input type="text" name="task-' + index + '" class="form-input__field">\
          </label>\
          <label class="form-input form-group__item form-group__item--20">Zeit\
            <input type="number" step="0.25" name="hours-' + index + '" class="form-input__field">\
          </label>\
        </div>';
    }
    return html;
  }

  // This variable holds all the weekdays HTML
  var markup = '
    <form class="form" action="save" method="post">\
      <h2 class="form__title">Metadaten</h2>\
      <div class="form-group">\
        <label class="form-input form-group__item form-group__item--20">Wochenbeginn\
          <input type="date" name="start" class="form-input__field">\
        </label>\
        <label class="form-input form-group__item form-group__item--80">Abteilung\
          <input type="text" name="department" class="form-input__field">\
        </label>\
      </div>\
      <h2 class="form__title">Arbeiten</h2>';

  // Create the weekdays HTML
  for (var i = 0; i < weekdays.length; i++) {
    markup += '\
      <div class="form-work">\
        <h3 class="form__subtitle">' + weekdays[i] + '</h3>\
        <div class="form-work__group">' + createWorkHTML(i) + '</div>\
        <button type="button" class="form-work__button form-work__button--add">+</button>\
      </div>'
  }

  markup += '\
      <button>Speichern</button>\
    </form>'

  return markup;
};




// MODULE EXPORT
// =============================================================================

module.exports = {
  title: 'Eintrag',
  subtitle: 'Eintrag bearbeiten',
  content: createForm(),
  backURL: '/'
};
