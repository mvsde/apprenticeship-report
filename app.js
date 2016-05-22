'use strict';



// NODE MODULES
// =============================================================================

// Third-party
const fs          = require('fs');
const express     = require('express');
const bodyParser  = require('body-parser');
const jsdom       = require('jsdom').jsdom;
const open        = require('open');

// Data
const paths       = require('./app/data/paths.js');
const cover       = require('./app/data/cover.js');
const database    = require('./app/data/database.js');

// Utilities
const html        = require('./app/utilities/html.js');
const convertDate = require('./app/utilities/convertDate.js');
const week        = require('./app/utilities/week.js');

// Pages
const indexPage   = require('./app/pages/index.js');
const coverPage   = require('./app/pages/cover.js');




// SETTINGS
// =============================================================================


// Array of weekdays
const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];




// PAGE TEMPLATE
// =============================================================================

function pageTemplate(title, subtitle, content, back) {
  // Load template from disk
  var htmlFile = fs.readFileSync(paths.html + 'scaffolding.html', 'utf-8');
  var document = jsdom(htmlFile).defaultView.document;

  // Inject dynamic content
  document.title = 'Berichtsheftdatenbank | ' + title;
  document.getElementById('title').innerHTML = title;
  document.getElementById('subtitle').innerHTML = subtitle;
  document.getElementById('content').innerHTML = content;
  document.getElementById('back').href = back;

  // Return HTML
  return document.documentElement.outerHTML;
}




// LOAD EXPRESS
// =============================================================================

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/app/static'));




// INDEX
// =============================================================================

app.get('/', function(req, res) {
  res.send(html.frame(indexPage.title, indexPage.header, indexPage.content));
});




// EDIT COVER
// =============================================================================

app.get('/cover', function(req, res) {
  res.send(html.frame(coverPage.title, coverPage.header, coverPage.content));
});




// SAVE COVER
// =============================================================================

app.post('/save-cover', function(req, res) {
  // Update cover
  var coverDB = cover.update(req.body, 'form');

  // Save cover
  cover.save(coverDB, function(status, message) {
    if (status === 'error') {
      res.send(html.frame(
        'Fehler beim Speichern',
        '<h1>Fehler beim Speichern</h1><p class="subtitle">Das Cover konnte nicht gespeichert werden.</p>',
        message
      ));
    } else {
      res.send(html.frame(
        'Cover gespeichert',
        '<h1>Cover gespeichert</h1><p class="subtitle">Das Cover wurde erfolgreich gespeichert.</p>',
        message
      ));
    }
  });
});




// WEEKDAYS FORM HTML
// =============================================================================

function createWeekdaysHTML(work) {
  var createWorkHTML = function(index) {
    var html = '';

    if (work && work[index]) {
      for (var i = 0; i < work[index].tasks.length; i++) {

        // Variable that holds the remove button HTML
        var removeButton = '';

        // Don't generate remove button HTML for first entry
        if (i > 0) {
          removeButton = '<button type="button" class="form-work__button form-work__button--remove">-</button>';
        }

        html += '<div class="form-group form-work__input">\
          <label class="form-input form-group__item form-group__item--80">Beschreibung\
            <input type="text" name="task-' + index + '" value="' + work[index].tasks[i] + '" class="form-input__field">\
          </label>\
          <label class="form-input form-group__item form-group__item--20">Zeit\
            <input type="number" step="0.25" name="hours-' + index + '" value="' + work[index].hours[i] + '" class="form-input__field">\
          </label>' + removeButton + '\
        </div>';
      }
    } else {
      html = '<div class="form-group form-work__input">\
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
  var weekdaysHTML = '';

  // Create the weekdays HTML
  for (var i = 0; i < weekdays.length; i++) {
    weekdaysHTML += '<div class="form-work">\
      <h3 class="form__subtitle">' + weekdays[i] + '</h3>\
      <div class="form-work__group">' + createWorkHTML(i) + '</div>\
      <button type="button" class="form-work__button form-work__button--add">+</button>\
    </div>'
  }

  return weekdaysHTML;
}




// NEW ENTRY
// =============================================================================

app.get('/new', function(req, res) {
  // Refresh database
  database.load();

  // Refresh cover
  cover.load();

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'entry.html', 'utf-8')).defaultView.document;

    // Inject dates
    document.querySelector('[name="start"]').defaultValue = convertDate.machine(week.currentWeek.monday);
    document.querySelector('[name="department"]').defaultValue = cover.entries.lastDepartment;

    // Check if current date has an entry
    var entryIndex;
    for (var i = 0; i < database.entries.length; i++) {
      if (database.entries[i].start === convertDate.machine(week.currentWeek.monday)) {
        entryIndex = i;
      }
    }

    // If current date has an entry
    // load this entry
    if (typeof entryIndex === 'number') {
      document.getElementById('weekdays').innerHTML = createWeekdaysHTML(database.entries[entryIndex].work);

    // Else load a clean entry form
    } else {
      document.getElementById('weekdays').innerHTML = createWeekdaysHTML();
    }

    return document.documentElement.outerHTML;
  };

  // Send HTML file
  res.send(pageTemplate(
    'Eintrag erstellen',
    'Einen neuen Eintrag erstellen.',
    pageContent(),
    '/')
  );
});




// EDIT ENTRY
// =============================================================================

app.get('/edit', function(req, res) {
  // Refresh database
  database.load();

  // Load entry from database
  var entry = database.entries[req.query.entry];

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'entry.html', 'utf-8')).defaultView.document;

    // Inject dates
    document.querySelector('[name="start"]').defaultValue = entry.start;
    document.querySelector('[name="department"]').defaultValue = entry.department;

    // Inject the weekdays form HTML
    document.getElementById('weekdays').innerHTML = createWeekdaysHTML(entry.work);

    return document.documentElement.outerHTML;
  };

  // Send HTML file
  res.send(pageTemplate(
    'Eintrag bearbeiten',
    'Einen bestehenden Eintrag bearbeiten.',
    pageContent(),
    '/print')
  );
});




// SAVE ENTRY
// =============================================================================

// Temporary entry holder variables
var tempEntry;
var tempEntryIndex;

app.post('/save', function(req, res) {
  // Refresh database
  database.load();

  // Refresh cover
  cover.load();

  // Check if entry already exists
  var entryIndex;
  for (var i = 0; i < database.entries.length; i++) {
    if (database.entries[i].start === req.body.start) {
      entryIndex = i;
    }
  }

  // Create entry skeleton
  var entry = {
    "start": req.body.start,
    "end": week.friday(req.body.start),
    "department": req.body.department,
    "work": []
  };

  // Save tasks and hours
  for (var i = 0; i < weekdays.length; i++) {
    var tasks = req.body['task-' + i];
    var hours = req.body['hours-' + i];

    if (typeof tasks === 'string') {
      tasks = [tasks];
    }

    if (hours === '') {
      hours = [0];
    } else if (typeof hours === 'string' && hours != '') {
      hours = [parseFloat(hours, 10)];
    } else if (Array.isArray(hours)) {
      for (var j = 0; j < hours.length; j++) {
        hours[j] = parseFloat(hours[j], 10);
      }
    }

    entry.work.push({
      tasks: tasks,
      hours: hours
    });
  }

  // If entry exists overwrite it
  if (typeof entryIndex === 'number') {

    // Create temporary entry information
    tempEntry = entry;
    tempEntryIndex = entryIndex;

    // Create page content
    var pageContent = '<section class="section">\
      <form class="form" action="overwrite" method="post">\
        <a href="javascript:history.back()" class="button">Abbrechen</a>\
        <input type="submit" value="Überschreiben">\
      </form>\
    </section>';

    // Send HTML file
    res.send(pageTemplate(
      'Eintrag überschreiben',
      'Möchten Sie diesen Eintrag wirklich überschreiben?',
      pageContent,
      'javascript:history.back()')
    );
  } else {

    // Create new database entry
    database.entries.push(entry);

    // Write JSON database file to disk
    fs.writeFile(paths.database, database.export(), function(err) {

      // Output error if there is one
      if (err) {
        res.send(pageTemplate(
          'Fehler',
          'Der Eintrag konnte nicht gespeichert werden.',
          err,
          'javascript:history.back()')
        );

      // Output success message
      } else {
        res.send(pageTemplate(
          'Eintrag gespeichert',
          'Der Eintrag wurde erfolgreich gespeichert.',
          '',
          '/new')
        );
      }
    });

    // Update cover last department with entry department
    cover.entries.lastDepartment = entry.department;

    // Write JSON cover file to disk
    fs.writeFileSync(paths.cover, cover.export());
  }
});




// OVERWRITE ENTRY
// =============================================================================

app.post('/overwrite', function(req, res) {
  // Overwrite existing entry with tempEntry
  database.entries[tempEntryIndex] = tempEntry;

  // Write JSON database file to disk
  fs.writeFile(paths.database, database.export(), function(err) {

    // Output error if there is one
    if (err) {
      res.send(pageTemplate(
        'Fehler',
        'Der Eintrag konnte nicht gespeichert werden.',
        err,
        'javascript:history.back()')
      );

    // Output success message
    } else {
      res.send(pageTemplate(
        'Eintrag gespeichert',
        'Der Eintrag wurde erfolgreich gespeichert.',
        '',
        '/new')
      );
    }
  });

  // Update cover last department with entry department
  cover.entries.lastDepartment = tempEntry.department;

  // Write JSON cover file to disk
  fs.writeFileSync(paths.cover, cover.export());
});




// DELETE ENTRY
// =============================================================================

// Temporary entry holder
var tempEntryDelete;

app.get('/delete', function(req, res) {
  // Refresh database
  database.load();

  // Save entry temporarily
  tempEntryDelete = req.query.entry;

  // Load entry from database
  var entry = database.entries[tempEntryDelete];

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'entry.html', 'utf-8')).defaultView.document;

    // Inject dates
    document.querySelector('[name="start"]').defaultValue = entry.start;
    document.querySelector('[name="department"]').defaultValue = entry.department;

    // Inject the weekdays form HTML
    document.getElementById('weekdays').innerHTML = createWeekdaysHTML(entry.work);

    // Disable input fields
    var inputs = document.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }

    // Remove buttons
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].parentNode.removeChild(buttons[i]);
    }

    // Add delete button
    var form = document.createElement('section');
    form.innerHTML = '<form class="form" action="confirm-delete" method="post">\
        <a href="javascript:history.back()" class="button">Abbrechen</a>\
        <input type="submit" value="Löschen">\
      </form>';
    document.querySelector('.section').appendChild(form);

    return document.documentElement.outerHTML;
  };

  // Send HTML file
  res.send(pageTemplate(
    'Eintrag löschen',
    'Möchten Sie diesen Eintrag wirklich löschen?',
    pageContent(),
    '/print')
  );
});




// CONFIRM DELETE
// =============================================================================

app.post('/confirm-delete', function(req, res) {
  // Remove database entry
  database.entries.splice(tempEntryDelete, 1);

  // Write JSON cover file to disk
  fs.writeFile(paths.database, database.export(), function(err) {

    // Output error if there is one
    if (err) {
      res.send(pageTemplate(
        'Fehler',
        'Der Eintrag konnte nicht gelöscht werden.',
        err,
        'javascript:history.back()')
      );

    // Output success message
    } else {
      res.send(pageTemplate(
        'Eintrag gelöscht',
        'Der Eintrag wurde erfolgreich gelöscht.',
        '',
        '/print')
      );
    }
  });
});




// PRINT OVERVIEW
// =============================================================================

app.get('/print', function(req, res) {
  // Refresh cover
  cover.load();

  // Refresh database
  database.load();

  // This variable holds all the entry HTML
  var entriesHTML = '';

  // Iterate through all entries
  for (var i = 0; i < database.entries.length; i++) {
    var daysHTML = '';
    var weekHours = 0;

    // Create the HTML for the daily tasks
    for (var j = 0; j < database.entries[i].work.length; j++) {
      var hours = database.entries[i].work[j].hours.reduce(function(a, b) { return a + b; });
      weekHours += hours;

      daysHTML += '<tr>\
        <td>' + weekdays[j] + '</td>\
        <td>' + database.entries[i].work[j].tasks.join('<br>') + '</td>\
        <td>' + database.entries[i].work[j].hours.join('<br>') + '</td>\
        <td>' + hours + '</td>\
      </tr>';
    }

    // Create the HTML frame for the whole empty
    entriesHTML += '<section class="section section--entry page-break--none">\
      <a href="edit?entry=' + i + '" class="button button--edit-entry print-hidden">\
        <span class="icon icon--edit"></span>\
      </a>\
      <a href="delete?entry=' + i + '" class="button button--delete-entry print-hidden">\
        <span class="icon icon--delete"></span>\
      </a>\
      <table class="table table--entry">\
        <thead>\
          <tr>\
            <th>' + database.entries[i].department + '</th>\
            <th>' + convertDate.human(database.entries[i].start) + ' bis ' + convertDate.human(database.entries[i].end) + '</th>\
            <th colspan="2">Nr. ' + (i + 1) + '</th>\
          </tr>\
          <tr>\
            <th>Tag</th>\
            <th>Ausgeführte Arbeiten oder Unterricht</th>\
            <th>Std.</th>\
            <th>Ges.</th>\
          </tr>\
        </thead>\
        <tfoot>\
          <tr>\
            <td colspan="3">Wochenstunden</td>\
            <td>' + weekHours + '</td>\
          </tr>\
        </tfoot>\
        <tbody>' +
          daysHTML +
        '</tbody>\
      </table>\
      <p class="signature">Auszubildender</p>\
      <p class="signature">Ausbilder/-in</p>\
    </section>';
  }

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'print.html', 'utf-8')).defaultView.document;

    // Print cover information
    for (var key in cover.entries) {
      if (document.getElementById(key)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(cover.entries[key])) {
          document.getElementById(key).innerHTML = convertDate.human(cover.entries[key]);
        } else {
          document.getElementById(key).innerHTML = cover.entries[key];
        }
      }
    }

    // Inject the HTML of all entries into the document
    document.getElementById('entries').innerHTML = entriesHTML;

    return document.documentElement.outerHTML;
  };

  // Send HTML file
  res.send(pageTemplate(
    cover.entries.title,
    cover.entries.subtitle,
    pageContent(),
    '/')
  );
});




// START SERVER
// =============================================================================

app.listen(0, function() {
  console.log('Server started at http://localhost:' + this.address().port);

  // Open default web browser
  // TODO: Create an entire application out of this
  open('http://localhost:' + this.address().port);
});
