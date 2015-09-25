'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var winston = require('winston');

var app = express();

global.logger = winston;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.FILE_LOG) {
  logger.add(winston.transports.File, {filename: 'logs.log'});
}
logger.remove(winston.transports.Console);
logger.add(winston.transports.Console,
  {level: process.env.CONSOLE_LOGLEVEL || 'debug'});

app.get('/', function (req, res) {
  logger.info('Main page');
  res.sendFile(path.resolve('./public/views/home.html'));
});

app.get('/env',
  function (req, res) {
    res.status(200).json({
      'API_URL': process.env.API_URL, 'API_PORT': process.env.API_PORT,
      'NODE_ENV': process.env.NODE_ENV
    });
  }
);

app.use(
  function (req, res) {
    res.status(404);
    logger.error('Page not found');
    res.send('Page does not exist');
  }
);


var PORT = process.env.WWW_PORT || '3000';

// listen
app.listen(PORT,
  function () {
    logger.info('Application running on port:', PORT);
  }
);
