(function() {
  var Pings, fs, isFile, os, path, spawn, touch, write;

  fs = require('fs');

  os = require('os');

  path = require('path');

  Pings = require('./src/pings');

  spawn = require('child_process').spawn;

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
          var gvim;
          if (error) {
            console.error(error);
            return process.exit(1);
          } else {
            gvim = spawn('gvim', ['-f', '--', tmpfile]);
            return gvim.on('close', function() {
              return fs.readFile(tmpfile, function(error, data) {
                var delTmpfile, log, writeLog;
                log = './log.json';
                delTmpfile = function() {
                  return fs.unlink(tmpfile);
                };
                writeLog = function() {
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
                      return write(log, newData, function() {
                        return delTmpfile();
                      });
                    }
                  });
                };
                if (isFile(log)) {
                  return writeLog();
                } else {
                  return touch(log, function() {
                    return writeLog();
                  });
                }
              });
            });
          }
        });
      });
    }
  });

}).call(this);
