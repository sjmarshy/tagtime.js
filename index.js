(function() {
  var Pings, fs, isFile, moment, os, path, spawn, touch, write, _;

  fs = require('fs');

  os = require('os');

  path = require('path');

  moment = require('moment');

  Pings = require('./src/pings');

  spawn = require('child_process').spawn;

  _ = require('underscore');

  touch = function(filename, done) {
    return fs.open(filename, 'w', function(error, fd) {
      if (error) {
        return done(new Error('unable to create tmpfile'));
      } else {
        return fs.close(fd, done);
      }
    });
  };

  isFile = function(name) {
    return fs.existsSync(name);
  };

  write = function(name, data, done) {
    return fs.writeFile(name, data, function(error) {
      if (error) {
        return done(error);
      } else {
        return done();
      }
    });
  };

  fs.readFile('./config/tagtime.json', function(error, buffer) {
    var config, pinger;
    if (error) {
      console.error(error);
      return process.exit(1);
    } else {
      config = JSON.parse(buffer.toString());
      pinger = new Pings(config.frequency);
      pinger.start();
      return pinger.on('ping', function(now) {
        var tmpfile;
        tmpfile = path.join(os.tmpdir(), "ping-" + now);
        return touch(tmpfile, function(error) {
          if (error) {
            console.error(error);
            return process.exit(1);
          } else {
            return write(tmpfile, "# " + (moment.unix(now).format('ddd HH:mm:ss')) + "\n", function() {
              var gvim;
              gvim = spawn('gvim', ['-f', '--', tmpfile]);
              fs.watch(tmpfile, function() {
                return fs.readFile(tmpfile, function(error, data) {
                  var log, nData, stripComments, writeLog;
                  log = './log.json';
                  stripComments = function(data) {
                    var lines, newdata, strdata;
                    if (data) {
                      strdata = data.toString();
                      lines = strdata.split('\n');
                      newdata = _(lines).reject(function(l) {
                        return l[0] === '#';
                      });
                      return newdata.join();
                    } else {
                      return '';
                    }
                  };
                  writeLog = function(data) {
                    return fs.readFile(log, function(error, logdata) {
                      var logJSON, newData;
                      if (!error) {
                        if (logdata.length > 0) {
                          logJSON = JSON.parse(logdata.toString());
                        } else {
                          logJSON = {};
                        }
                        logJSON[now] = data.toString();
                        newData = JSON.stringify(logJSON);
                        return write(log, newData, function() {});
                      }
                    });
                  };
                  if (isFile(log)) {
                    nData = stripComments(data);
                    return writeLog(nData);
                  } else {
                    return touch(log, function() {
                      nData = stripComments(data);
                      return writeLog(nData);
                    });
                  }
                });
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
