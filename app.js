'use strict';

// Node Modules
const fs         = require('fs');
const express    = require('express');
const bodyParser = require('body-parser');
const jsdom      = require('jsdom');
const open       = require('open');




// Settings
const paths = {
  config:   './db/config.json',
  database: './db/database.json'
}

// Create database variables
var config;
var database;

// Wrap database loading into a function
// This way we can later use this function
// to refresh the variable information
var loadDatabase = function() {
  config   = JSON.parse(fs.readFileSync(paths.config));
  database = JSON.parse(fs.readFileSync(paths.database)).entries;
};

// Initial database loading
loadDatabase();




// Load Express App
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/app'));




// Serve config page
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




// Handle config saving
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




// Serve new entry page
app.get('/new', function(req, res) {
  // Refresh database
  loadDatabase();

  // Get HTML file from local disk
  fs.readFile('./app/entry.html', 'utf8', function(error, data) {

    // Modify the file with jsdom
    jsdom.env(data, [], function(errors, window) {

      window.document.getElementById('title').innerHTML = 'Eintrag erstellen';
      window.document.getElementById('subtitle').innerHTML = 'Einen neuen Eintrag erstellen.';

      window.document.getElementById('menu').removeChild(window.document.getElementById('menu-new'));

      // Send the modified HTML file to the user
      res.send(window.document.documentElement.outerHTML);

      // Close the jsdom window
      window.close();
    });
  });
});




// Serve edit entry page
app.get('/edit', function(req, res) {
  // Refresh database
  loadDatabase();

  // Get HTML file from local disk
  fs.readFile('./app/entry.html', 'utf8', function(error, data) {

    // Modify the file with jsdom
    jsdom.env(data, [], function(errors, window) {

      window.document.getElementById('title').innerHTML = 'Eintrag bearbeiten';
      window.document.getElementById('subtitle').innerHTML = 'Einen bestehenden Eintrag bearbeiten.';

      // Send the modified HTML file to the user
      res.send(window.document.documentElement.outerHTML);

      // Close the jsdom window
      window.close();
    });
  });
});




// Serve print page
app.get('/print', function(req, res) {
  // Refresh database
  loadDatabase();

  // Sort database by week
  database.sort(function(a, b) {
    var dateA = new Date(a.start);
    var dateB = new Date(b.start);

    return dateA - dateB;
  });

  // Get HTML file from local disk
  fs.readFile('./app/print.html', 'utf8', function(error, data) {

    // Modify the file with jsdom
    jsdom.env(data, [], function(errors, window) {

      // Print config information
      for (var key in config) {
        window.document.getElementById(key).innerHTML = config[key];
      }

      // TODO: Provide localization file
      const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

      // This variable holds all the entry HTML
      var entriesHTML = '';

      // Iterate through all entries
      for (var i = 0, item; item = database[i++];) {
        var daysHTML = '';
        var weekHours = 0;

        // Create the HTML for the daily tasks
        for (var j = 0, day; day = item.work[j++];) {
          var hours = day.hours.reduce(function(a, b) { return a + b; });
          weekHours += hours;

          daysHTML += '<tr>\
            <td>' + weekDays[j - 1] + '</td>\
            <td>' + day.tasks.join('<br>') + '</td>\
            <td>' + day.hours.join('<br>') + '</td>\
            <td>' + hours + '</td>\
          </tr>';
        }

        // Create the HTML frame for the whole empty
        entriesHTML += '<section class="section section--entry page-break--none">\
          <table class="table table--entry">\
            <thead>\
              <tr>\
                <th colspan="2">' + item.start + ' bis ' + item.end + '</th>\
                <th colspan="2">Nr. ' + i + '</th>\
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

      // Inject the HTML of all entries into the document
      window.document.getElementById('entries').innerHTML = entriesHTML;

      // Send the modified HTML file to the user
      res.send(window.document.documentElement.outerHTML);

      // Close the jsdom window
      window.close();
    });
  });
});




// Start web server and open default browser
app.listen(0, function() {
  console.log('Server started at http://127.0.0.1:' + this.address().port);

  // Open default web browser
  // TODO: Create an entire application out of this
  open('http://127.0.0.1:' + this.address().port);
});
