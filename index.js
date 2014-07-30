(function() {
  var Logger, Pings, fs, moment, os, path, spawn, _;

  fs = require('fs');

  os = require('os');

  path = require('path');

  moment = require('moment');

  Pings = require('./src/pings');

  Logger = require('./src/logger');

  spawn = require('child_process').spawn;

  _ = require('underscore');

  fs.readFile('./config/tagtime.json', function(error, buffer) {
    var config, logger, pinger;
    if (error) {
      console.error(error);
      return process.exit(1);
    } else {
      config = JSON.parse(buffer.toString());
      pinger = new Pings(config.frequency);
      logger = new Logger('./log.json');
      logger.createLog();
      pinger.start();
      return pinger.on('ping', function(now) {
        var popular, tmpfile;
        tmpfile = path.join(os.tmpdir(), "ping-" + now);
        popular = logger.getMostPopular();
        return Logger.touch(tmpfile, function(error) {
          var popularString, tmpString;
          if (error) {
            console.error(error);
            return process.exit(1);
          } else {
            tmpString = "\n# " + (moment.unix(now).format('ddd HH:mm:ss')) + "\n";
            popularString = _(popular).reduce(function(mem, val, key) {
              if (val > 5) {
                return mem + ("\n#" + key + ":");
              } else {
                return mem;
              }
            }, tmpString);
            return Logger.write(tmpfile, popularString, function() {
              var gvim, watcher;
              gvim = spawn('gvim', ['-f', '--', tmpfile]);
              watcher = fs.watch(tmpfile, function() {
                return fs.readFile(tmpfile, function(error, data) {
                  if (data) {
                    data = data.toString();
                    return logger.writeLog(Logger.stripComments(data), now);
                  }
                });
              });
              watcher.on('change', function() {
                return watcher.close();
              });
              return gvim.on('close', function() {
                return fs.unlink(tmpfile);
              });
            });
          }
        });
      });
    }
  });

}).call(this);
