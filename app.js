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




// Handle HTML file delivery
app.get('/:file', function(req, res) {
  var options = {root: __dirname + '/app'};

  switch (req.params.file) {
    // Config
    case "config":
      fs.readFile('./app/config.html', 'utf8', function(error, data) {
        jsdom.env(data, [], function(errors, window) {
          for (var key in config) {
            window.document.querySelector('[name="' + key + '"]').defaultValue = config[key];
          }

          res.send(window.document.documentElement.outerHTML);
          window.close();
        });
      });
      break;

    // New entry
    case "new":
      fs.readFile('./app/new.html', 'utf8', function(error, data) {
        jsdom.env(data, [], function(errors, window) {
          res.send(window.document.documentElement.outerHTML);
          window.close();
        });
      });
      break;

    // Edit entry
    case "edit":
      fs.readFile('./app/edit.html', 'utf8', function(error, data) {
        jsdom.env(data, [], function(errors, window) {
          res.send(window.document.documentElement.outerHTML);
          window.close();
        });
      });
      break;

    // Print report
    case "print":
      fs.readFile('./app/print.html', 'utf8', function(error, data) {
        jsdom.env(data, [], function(errors, window) {
          for (var key in config) {
            window.document.getElementById(key).innerHTML = config[key];
          }

          res.send(window.document.documentElement.outerHTML);
          window.close();
        });
      });
      break;

    // Default page
    default:
      res.sendFile('/index.html', options);
  }
});




// Handle config saving
app.post('/config', function(req, res) {
  console.log('\nConfig submitted.');

  for (var key in req.body) {
    if (req.body[key]) {
      config[key] = req.body[key];
    }
  }

  fs.writeFile(paths.config, JSON.stringify(config, null, 2), function(err) {
    if (err) { return console.log(err); }
    console.log('Config saved.');
  });

  res.redirect('/config');
});




// Start web server and open default browser
app.listen(0, function() {
  console.log('Server started at http://127.0.0.1:' + this.address().port);
  console.log('\nOpening default web browser...');
  open('http://127.0.0.1:' + this.address().port);
});
