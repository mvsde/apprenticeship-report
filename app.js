'use strict';

// Node Modules
const fs         = require('fs');
const express    = require('express');
const bodyParser = require('body-parser');
const jsdom      = require('jsdom');
const open       = require('open');




// SETTINGS
// =============================================================================

const paths = {
  config:   './db/config.json',
  database: './db/database.json'
}

// TODO: Provide localization file
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




// LOAD EXPRESS
// =============================================================================

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/app'));




// CONFIG PAGE
// =============================================================================

app.get('/config', function(req, res) {
  // Refresh database
  loadDatabase();

  // Get HTML file from local disk
  fs.readFile('./app/config.html', 'utf8', function(error, data) {

    // Modify the file with jsdom
    jsdom.env(data, [], function(errors, window) {

      // Inject settings as default input values
      for (var key in config) {
        window.document.querySelector('[name="' + key + '"]').defaultValue = config[key];
      }

      // Send the modified HTML file to the user
      res.send(window.document.documentElement.outerHTML);

      // Close the jsdom window
      window.close();
    });
  });
});




// CONFIG SAVING
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

    // Get success/error HTML file from disk
    fs.readFile('./app/config-saved.html', 'utf8', function(error, data) {

      // Modify the file with jsdom
      jsdom.env(data, [], function(errors, window) {

        // If we have an error message inject it into the HTML
        if (err) {
          window.document.getElementById('title').innerHTML = 'Einstellungen wurden nicht gespeichert';
          window.document.getElementById('subtitle').innerHTML = err;
        }

        // Send the modified HTML file to the user
        res.send(window.document.documentElement.outerHTML);

        // Close the jsdom window
        window.close();
      });
    });
  });
});




// CREATE WEEKDAYS FORM HTML
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




// NEW ENTRY PAGE
// =============================================================================

app.get('/new', function(req, res) {
  // Refresh database
  loadDatabase();

  // Get HTML file from local disk
  fs.readFile('./app/entry.html', 'utf8', function(error, data) {

    // Modify the file with jsdom
    jsdom.env(data, [], function(errors, window) {

      // Inject the correct title and subtitle
      window.document.getElementById('title').innerHTML = 'Eintrag erstellen';
      window.document.getElementById('subtitle').innerHTML = 'Einen neuen Eintrag erstellen.';

      // Remove the menu entry
      window.document.getElementById('menu').removeChild(window.document.getElementById('menu-new'));

      // Inject the weekdays form HTML
      window.document.getElementById('weekdays').innerHTML = createWeekdaysHTML();

      // Send the modified HTML file to the user
      res.send(window.document.documentElement.outerHTML);

      // Close the jsdom window
      window.close();
    });
  });
});




// EDIT ENTRY PAGE
// =============================================================================

app.get('/edit', function(req, res) {
  // Refresh database
  loadDatabase();

  var entry = database[req.query.entry];

  // Get HTML file from local disk
  fs.readFile('./app/entry.html', 'utf8', function(error, data) {

    // Modify the file with jsdom
    jsdom.env(data, [], function(errors, window) {

      // Inject the correct title and subtitle
      window.document.getElementById('title').innerHTML = 'Eintrag bearbeiten';
      window.document.getElementById('subtitle').innerHTML = 'Einen bestehenden Eintrag bearbeiten.';

      // Inject dates
      window.document.querySelector('[name="start"]').defaultValue = entry.start;
      window.document.querySelector('[name="end"]').defaultValue = entry.end;

      // Inject the weekdays form HTML
      window.document.getElementById('weekdays').innerHTML = createWeekdaysHTML(entry.work);

      // Send the modified HTML file to the user
      res.send(window.document.documentElement.outerHTML);

      // Close the jsdom window
      window.close();
    });
  });
});




// ENTRY SAVING
// =============================================================================

app.post('/entry-saved', function(req, res) {
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
  // TODO: Ask the user to confirm
  if (typeof entryIndex === 'number') {
    database[entryIndex] = entry;
  } else {
    database.push(entry);
  }

  // Write JSON config file to disk
  fs.writeFile(paths.database, JSON.stringify(database, null, 2), function(err) {

    // Get success/error HTML file from disk
    fs.readFile('./app/entry-saved.html', 'utf8', function(error, data) {

      // Modify the file with jsdom
      jsdom.env(data, [], function(errors, window) {

        // If we have an error message inject it into the HTML
        if (err) {
          window.document.getElementById('title').innerHTML = 'Eintrag wurde nicht gespeichert';
          window.document.getElementById('subtitle').innerHTML = err;
        }

        // Send the modified HTML file to the user
        res.send(window.document.documentElement.outerHTML);

        // Close the jsdom window
        window.close();
      });
    });
  });
});




// PRINT PAGE
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

  // Get HTML file from local disk
  fs.readFile('./app/print.html', 'utf8', function(error, data) {

    // Modify the file with jsdom
    jsdom.env(data, [], function(errors, window) {

      // Print config information
      for (var key in config) {
        window.document.getElementById(key).innerHTML = config[key];
      }

      // Inject the HTML of all entries into the document
      window.document.getElementById('entries').innerHTML = entriesHTML;

      // Send the modified HTML file to the user
      res.send(window.document.documentElement.outerHTML);

      // Close the jsdom window
      window.close();
    });
  });
});




// START SERVER
// =============================================================================

app.listen(0, function() {
  console.log('Server started at http://localhost:' + this.address().port);

  // Open default web browser
  // TODO: Create an entire application out of this
  open('http://localhost:' + this.address().port);
});
