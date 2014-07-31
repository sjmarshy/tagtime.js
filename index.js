(function() {
  var Logfile, Pings, fs, getConfig, getPopularBreakdown, handleError, hapi, moment, os, path, q, spawn, _;

  hapi = require('hapi');

  q = require('q');

  fs = require('fs');

  os = require('os');

  path = require('path');

  moment = require('moment');

  Pings = require('./src/pings');

  Logfile = require('./src/logfile');

  spawn = require('child_process').spawn;

  _ = require('underscore');

  getConfig = function(fname) {
    var d;
    d = q.defer();
    fs.readFile(fname, function(error, buffer) {
      if (error) {
        return d.reject(error);
      } else {
        return d.resolve(JSON.parse(buffer.toString()));
      }
    });
    return d.promise;
  };

  handleError = function(error) {
    console.error(error);
    return process.exit(1);
  };

  getPopularBreakdown = function(popular) {
    var breakdown;
    breakdown = "# Popular top-level tags";
    return _(popular).reduce(function(memo, value, key) {
      if (value > 5) {
        return memo + ("\n#    " + key);
      } else {
        return memo;
      }
    }, breakdown);
  };

  getConfig('./config/tagtime.json').then(function(config) {
    var logfile, pinger;
    pinger = new Pings(config.frequency);
    logfile = new Logfile('./log.json');
    logfile.createLog();
    pinger.start();
    return pinger.on('ping', function(now) {
      var popular, tmpfile;
      tmpfile = path.join(os.tmpdir(), "ping-" + now);
      popular = logfile.getMostPopular();
      return Logfile.touch(tmpfile, function(error) {
        var tmpString;
        if (error) {
          return handleError(error);
        } else {
          tmpString = "\n# " + (moment.unix(now).format('ddd HH:mm:ss')) + "\n";
          tmpString += getPopularBreakdown(popular);
          return Logfile.write(tmpfile, tmpString, function() {
            var gvim, watcher;
            gvim = spawn('gvim', ['-f', '--', tmpfile]);
            watcher = fs.watch(tmpfile, function() {
              return fs.readFile(tmpfile, function(error, data) {
                if (data) {
                  data = data.toString();
                  return logfile.writeLog(Logfile.stripComments(data), now);
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
  })["catch"](handleError);

}).call(this);
