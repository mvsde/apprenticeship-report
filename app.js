// Node Modules
const express = require('express');
const bodyParser = require('body-parser');

// Load Configuration File
var config   = require('./db/config.json');

// Load Database
var database = require('./db/database.json');

// Load Express App
var app = express();
