(function() {
  var Logger, fs, _;

  fs = require('fs');

  _ = require('underscore');

  module.exports = Logger = (function() {
    Logger.handleError = function(error) {
      console.error(error);
      return process.exit(1);
    };

    Logger.touch = function(fname, done) {
      return fs.open(fname, 'w', function(error, fd) {
        if (error) {
          return done(new Error('unable to create tmpfile'));
        } else {
          return fs.close(fd, done);
        }
      });
    };

    Logger.isFile = function(fname) {
      return fs.existsSync(fname);
    };

    Logger.write = function(fname, data, done) {
      return fs.writeFile(fname, data, function(error) {
        if (error) {
          return done(error);
        } else {
          return done();
        }
      });
    };

    Logger.read = function(fname, done) {
      return fs.readFile(fname, done);
    };

    Logger.stripComments = function(data) {
      var lines, newdata;
      lines = data.split('\n');
      newdata = _(lines).reject(function(l) {
        return l[0] === '#';
      });
      return newdata.join(' ');
    };

    function Logger(logfile) {
      this.logfile = logfile;
    }

    Logger.prototype.writeLog = function(data, now) {
      return Logger.read(this.logfile, (function(_this) {
        return function(error, log) {
          var json, newLog;
          if (!error) {
            if (data.length > 0) {
              json = JSON.parse(log.toString());
            } else {
              json = {};
            }
            json[now] = data;
            newLog = JSON.stringify(json);
            return Logger.write(_this.logfile, newLog, function(error) {
              if (error) {
                return Logger.handleError(error);
              }
            });
          } else {
            return Logger.handleError(error);
          }
        };
      })(this));
    };

    Logger.prototype.createLog = function() {
      if (!Logger.isFile(this.logfile)) {
        return Logger.touch(this.logfile, function(error) {
          if (error) {
            return Logger.handleError(error);
          }
        });
      }
    };

    return Logger;

  })();

}).call(this);
