'use strict';




// NODE MODULES
// =============================================================================

const fs         = require('fs');
const express    = require('express');
const bodyParser = require('body-parser');
const jsdom      = require('jsdom').jsdom;
const open       = require('open');




// SETTINGS
// =============================================================================

const paths = {
  config:   './db/config.json',
  database: './db/database.json',
  html:     './html/'
}

// Array of weekdays
const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

// Create database variables
var config;
var database;

// Wrap database loading into a function
// This way we can later use this function
// to refresh the variable information
var loadDatabase = function() {
  config   = JSON.parse(fs.readFileSync(paths.config));
  database = JSON.parse(fs.readFileSync(paths.database));

  // Sort database by week
  database.sort(function(a, b) {
    var dateA = new Date(a.start);
    var dateB = new Date(b.start);

    return dateA - dateB;
  });
};

// Initial database loading
loadDatabase();




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
app.use(express.static(__dirname + '/app'));




// INDEX.html
// =============================================================================

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/html/index.html');
});




// EDIT CONFIG
// =============================================================================

app.get('/config', function(req, res) {
  // Refresh database
  loadDatabase();

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'config.html', 'utf-8')).defaultView.document;

    // Inject settings as default input values
    for (var key in config) {
      document.querySelector('[name="' + key + '"]').defaultValue = config[key];
    }

    return document.documentElement.outerHTML;
  };

  // Send HTML file
  res.send(pageTemplate(
    'Einstellungen',
    'Allgemeine Einstellungen und Informationen über den Auszubildenden.',
    pageContent(),
    '/')
  );
});




// SAVE CONFIG
// =============================================================================

app.post('/config-saved', function(req, res) {

  // Update config JSON
  for (var key in req.body) {
    if (req.body[key]) {
      config[key] = req.body[key];
    }
  }

  // Write JSON config file to disk
  fs.writeFile(paths.config, JSON.stringify(config, null, 2), function(err) {

    // Output error if there is one
    if (err) {
      res.send(pageTemplate(
        'Fehler',
        'Die Einstellungen konnten nicht gespeichert werden.',
        err,
        'javascript:history.back()')
      );

    // Output success message
    } else {
      res.send(pageTemplate(
        'Einstellungen gespeichert',
        'Die Einstellungen wurden erfolgreich gespeichert.',
        '',
        '/config')
      );
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
          removeButton = '<button class="form-work__button form-work__button--remove">-</button>';
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
      <button class="form-work__button form-work__button--add">+</button>\
    </div>'
  }

  return weekdaysHTML;
}




// NEW ENTRY
// =============================================================================

app.get('/new', function(req, res) {
  // Refresh database
  loadDatabase();

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'entry.html', 'utf-8')).defaultView.document;

    // Inject the weekdays form HTML
    document.getElementById('weekdays').innerHTML = createWeekdaysHTML();

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
  loadDatabase();

  // Load entry from database
  var entry = database[req.query.entry];

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'entry.html', 'utf-8')).defaultView.document;

    // Inject dates
    document.querySelector('[name="start"]').defaultValue = entry.start;
    document.querySelector('[name="end"]').defaultValue = entry.end;

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
  loadDatabase();

  // Check if entry already exists
  var entryIndex;
  for (var i = 0; i < database.length; i++) {
    if (database[i].start === req.body.start) {
      entryIndex = i;
    }
  }

  // Create entry skeleton
  var entry = {
    "start": req.body.start,
    "end": req.body.end,
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
      hours = [parseInt(hours, 10)];
    } else if (Array.isArray(hours)) {
      for (var j = 0; j < hours.length; j++) {
        hours[j] = parseInt(hours[j], 10);
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
    database.push(entry);

    // Write JSON config file to disk
    fs.writeFile(paths.database, JSON.stringify(database, null, 2), function(err) {

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
  }
});




// OVERWRITE ENTRY
// =============================================================================

app.post('/overwrite', function(req, res) {
  // Overwrite existing entry with tempEntry
  database[tempEntryIndex] = tempEntry;

  // Write JSON config file to disk
  fs.writeFile(paths.database, JSON.stringify(database, null, 2), function(err) {

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
});




// DELETE ENTRY
// =============================================================================

// Temporary entry holder
var tempEntryDelete;

app.get('/delete', function(req, res) {
  // Refresh database
  loadDatabase();

  // Save entry temporarily
  tempEntryDelete = req.query.entry;

  // Load entry from database
  var entry = database[tempEntryDelete];

  // Create page content
  var pageContent = function() {
    // Load template from disk
    var document = jsdom(fs.readFileSync(paths.html + 'entry.html', 'utf-8')).defaultView.document;

    // Inject dates
    document.querySelector('[name="start"]').defaultValue = entry.start;
    document.querySelector('[name="end"]').defaultValue = entry.end;

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
  // Create new database entry
  database.splice(tempEntryDelete, 1);

  // Write JSON config file to disk
  fs.writeFile(paths.database, JSON.stringify(database, null, 2), function(err) {

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
        '/new')
      );
    }
  });
});




// PRINT OVERVIEW
// =============================================================================

app.get('/print', function(req, res) {
  // Refresh database
  loadDatabase();

  // This variable holds all the entry HTML
  var entriesHTML = '';

  // Iterate through all entries
  for (var i = 0; i < database.length; i++) {
    var daysHTML = '';
    var weekHours = 0;

    // Create the HTML for the daily tasks
    for (var j = 0; j < database[i].work.length; j++) {
      var hours = database[i].work[j].hours.reduce(function(a, b) { return a + b; });
      weekHours += hours;

      daysHTML += '<tr>\
        <td>' + weekdays[j] + '</td>\
        <td>' + database[i].work[j].tasks.join('<br>') + '</td>\
        <td>' + database[i].work[j].hours.join('<br>') + '</td>\
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
            <th colspan="2">' + database[i].start + ' bis ' + database[i].end + '</th>\
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

    // Print config information
    for (var key in config) {
      if (document.getElementById(key)) {
        document.getElementById(key).innerHTML = config[key];
      }
    }

    // Inject the HTML of all entries into the document
    document.getElementById('entries').innerHTML = entriesHTML;

    return document.documentElement.outerHTML;
  };

  // Send HTML file
  res.send(pageTemplate(
    config.title,
    config.subtitle,
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
