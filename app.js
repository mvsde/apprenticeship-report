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

// Load config and database
var config   = require(paths.config);
var database = require(paths.database);




// Load Express App
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/app'));




// Serve config page
app.get('/config', function(req, res) {
  fs.readFile('./app/config.html', 'utf8', function(error, data) {
    jsdom.env(data, [], function(errors, window) {
      for (var key in config) {
        window.document.querySelector('[name="' + key + '"]').defaultValue = config[key];
      }

      res.send(window.document.documentElement.outerHTML);
      window.close();
    });
  });
});




// Serve new entry page
app.get('/new', function(req, res) {
  fs.readFile('./app/new.html', 'utf8', function(error, data) {
    jsdom.env(data, [], function(errors, window) {
      res.send(window.document.documentElement.outerHTML);
      window.close();
    });
  });
});




// Serve edit entry page
app.get('/edit', function(req, res) {
  fs.readFile('./app/edit.html', 'utf8', function(error, data) {
    jsdom.env(data, [], function(errors, window) {
      res.send(window.document.documentElement.outerHTML);
      window.close();
    });
  });
});




// Serve print page
app.get('/print', function(req, res) {
  fs.readFile('./app/print.html', 'utf8', function(error, data) {
    jsdom.env(data, [], function(errors, window) {
      for (var key in config) {
        window.document.getElementById(key).innerHTML = config[key];
      }

      var entriesHTML = '';
      const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

      for (var i = 0, item; item = database.entries[i++];) {
        var daysHTML = '';
        var weekHours = 0;

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

      window.document.getElementById('entries').innerHTML = entriesHTML;

      res.send(window.document.documentElement.outerHTML);
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

  // Write file
  fs.writeFile(paths.config, JSON.stringify(config, null, 2), function(err) {

    // Serve success/error page
    fs.readFile('./app/config-saved.html', 'utf8', function(error, data) {
      jsdom.env(data, [], function(errors, window) {
        if (err) {
          window.document.getElementById('title').innerHTML = 'Einstellungen wurden nicht gespeichert';
          window.document.getElementById('subtitle').innerHTML = err;
        }
        res.send(window.document.documentElement.outerHTML);
        window.close();
      });
    });
  });
});




// Start web server and open default browser
app.listen(0, function() {
  console.log('Server started at http://127.0.0.1:' + this.address().port);
  open('http://127.0.0.1:' + this.address().port);
});
