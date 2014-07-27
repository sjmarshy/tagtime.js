(function() {
  var Pings, fs;

  fs = require('fs');

  Pings = require('./src/pings');

  fs.readFile('./config/tagtime.json', function(error, buffer) {
    var config, pinger;
    if (error) {
      console.error(error);
      return process.exit(1);
    } else {
      config = JSON.parse(buffer.toString());
      pinger = new Pings(config.frequency);
      return pinger.start();
    }
  });

}).call(this);
