// Node Modules
const fs         = require('fs');
const express    = require('express');
const bodyParser = require('body-parser');
const open       = require('open');

// Settings
const paths = {
  config: './db/config.json',
  database: './db/database.json'
}

// Load Configuration File
var config   = require(paths.config);

// Load Database
var database = require(paths.database);

// Load Express App
var app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));

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


app.listen(0, function() {
  console.log('Server started at http://127.0.0.1:' + this.address().port);
  console.log('\nOpening default web browser...');
  open('http://127.0.0.1:' + this.address().port);
});
