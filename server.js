'use strict';
require('dotenv').config();
var server = require('./app');
var port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Server running on port: %d', port); 
});
 