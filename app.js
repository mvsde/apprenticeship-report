// Node Modules
const express = require('express');
const bodyParser = require('body-parser');
const open = require('open');

// Load Configuration File
var config   = require('./db/config.json');

// Load Database
var database = require('./db/database.json');

// Load Express App
var app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));

app.post('/save-settings', function(req, res) {
  res.send('The next page...');
  console.log(req.body);
});


app.listen(1337, function() {
  console.log('Server started at http://127.0.0.1:1337');
  console.log('Opening default web browser...');
  open('http://127.0.0.1:1337/app.html');
});
