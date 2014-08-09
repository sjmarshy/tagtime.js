(function() {
  var Hapi, Logfile, Pings, api, fs, getAllPopularString, getConfig, getPopularBreakdown, handleError, moment, os, path, q, server, spawn, _;

  Hapi = require('hapi');

  q = require('q');

  fs = require('fs');

  os = require('os');

  path = require('path');

  moment = require('moment');

  Pings = require('./src/pings');

  Logfile = require('./src/logfile');

  spawn = require('child_process').spawn;

  _ = require('underscore');

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

  getAllPopularString = function(log) {
    var counts, string;
    counts = log.getMostPopular();
    string = "# all popular tags";
    return _(counts).reduce(function(memo, value, key) {
      if (value > 5) {
        return memo + ("\n#    " + key + "(" + value + ")");
      } else {
        return memo;
      }
    }, string);
  };

  api = function(server, logfile, pinger) {
    var getLast;
    getLast = function(req, res) {
      return res(pinger.lst);
    };
    server.route([
      {
        method: 'GET',
        path: '/api/tags/popularity',
        handler: function(req, res) {
          return res(logfile.getMostPopular());
        }
      }, {
        method: 'GET',
        path: '/api/tags',
        handler: function(req, res) {
          return res(logfile.getTagsAsTree());
        }
      }, {
        method: 'GET',
        path: '/api/tags/flat',
        handler: function(req, res) {
          return res(logfile.getTagsAsUniqueList());
        }
      }, {
        method: 'GET',
        path: '/api/tags/flat/raw',
        handler: function(req, res) {
          return res(logfile.getTagsAsList());
        }
      }, {
        method: 'GET',
        path: '/api/tags/detail',
        handler: function(req, res) {
          return res(logfile.getTagsAsDetailTree());
        }
      }
    ]);
    server.route([
      {
        method: 'GET',
        path: '/api/time/prev',
        handler: getLast
      }, {
        method: 'GET',
        path: '/api/time/last',
        handler: getLast
      }, {
        method: 'GET',
        path: '/api/time/next',
        handler: function(req, res) {
          return res(pinger.nxt);
        }
      }
    ]);
    return server.start();
  };

  getConfig('./config/tagtime.json').then(function(config) {
    var logfile, pinger;
    pinger = new Pings(config.frequency);
    logfile = new Logfile('./log.json');
    logfile.createLog();
    api(server, logfile, pinger);
    pinger.start();
    return pinger.on('ping', function(now) {
      var popular, tmpfile;
      tmpfile = path.join(os.tmpdir(), "ping-" + now);
      popular = logfile.getMostPopularTopLevel();
      return Logfile.touch(tmpfile, function(error) {
        var tmpString;
        if (error) {
          return handleError(error);
        } else {
          tmpString = "\n# " + (moment.unix(now).format('ddd HH:mm:ss')) + "\n";
          tmpString += getPopularBreakdown(popular);
          tmpString += getAllPopularString(logfile);
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
