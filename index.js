(function() {
  var Hapi, Logfile, Pings, Tags, api, fs, getConfig, handleError, moment, os, path, q, server, spawn, _;

  Hapi = require('hapi');

  Pings = require('./src/pings');

  Logfile = require('./src/logfile');

  Tags = require('./src/tags');

  q = require('q');

  fs = require('fs');

  os = require('os');

  path = require('path');

  moment = require('moment');

  spawn = require('child_process').spawn;

  _ = require('underscore');

  api = require('./src/api');

  server = new Hapi.Server(3891);

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

  getConfig('./config/tagtime.json').then(function(config) {
    var logfile, pinger, tags;
    pinger = new Pings(config.frequency);
    logfile = new Logfile('./log.json');
    logfile.createLog();
    tags = new Tags(logfile);
    api(server, tags, pinger);
    pinger.start();
    return pinger.on('ping', function(now) {
      var tmpfile;
      tmpfile = path.join(os.tmpdir(), "ping-" + now);
      return Logfile.touch(tmpfile, function(error) {
        var tmpString;
        if (error) {
          return handleError(error);
        } else {
          tmpString = "\n# " + (moment.unix(now).format('ddd HH:mm:ss')) + "\n";
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
