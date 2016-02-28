// Node Modules
const fs         = require('fs');
const express    = require('express');
const bodyParser = require('body-parser');
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
app.get('/:name', function(req, res) {
  var options = {root: __dirname + '/app'}

  switch (req.params.name) {
    case "config":
      res.sendFile('/config.html', options);
      break;
    case "new":
      res.sendFile('/new.html', options);
      break;
    case "edit":
      res.sendFile('/edit.html', options);
      break;
    default:
      res.sendFile('/index.html', options);
  }
});




// Handle config saving
app.post('/config.html', function(req, res) {
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
});




// Start web server and open default browser
app.listen(0, function() {
  console.log('Server started at http://127.0.0.1:' + this.address().port);
  console.log('\nOpening default web browser...');
  open('http://127.0.0.1:' + this.address().port);
});
