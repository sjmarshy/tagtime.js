(function() {
  var EventEmitter, Logfile, fs, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  _ = require('underscore');

  EventEmitter = require('events').EventEmitter;

  module.exports = Logfile = (function(_super) {
    __extends(Logfile, _super);

    Logfile.handleError = function(error) {
      console.error(error);
      return process.exit(1);
    };

    Logfile.touch = function(fname, done) {
      return fs.open(fname, 'w', function(error, fd) {
        if (error) {
          return done(new Error('unable to create tmpfile'));
        } else {
          return fs.close(fd, done);
        }
      });
    };

    Logfile.isFile = function(fname) {
      return fs.existsSync(fname);
    };

    Logfile.write = function(fname, data, done) {
      return fs.writeFile(fname, data, function(error) {
        if (error) {
          return done(error);
        } else {
          return done();
        }
      });
    };

    Logfile.read = function(fname, done) {
      return fs.readFile(fname, function(error, data) {
        if (!error) {
          if (data.length > 0) {
            return done(JSON.parse(data.toString()));
          } else {
            return done({});
          }
        } else {
          return Logfile.handleError(error);
        }
      });
    };

    Logfile.stripComments = function(data) {
      var lines, newdata;
      lines = data.split('\n');
      newdata = _(lines).reject(function(l) {
        return l[0] === '#';
      });
      return newdata.join(' ');
    };

    function Logfile(logfile) {
      this.logfile = logfile;
      Logfile.read(this.logfile, (function(_this) {
        return function(log) {
          _this.data = log;
          return _this.emit('read', log);
        };
      })(this));
    }

    Logfile.prototype.writeLog = function(data, now) {
      this.emit('ping', now, data);
      return Logfile.read(this.logfile, (function(_this) {
        return function(log) {
          var newLog;
          log[now] = data;
          newLog = JSON.stringify(log);
          return Logfile.write(_this.logfile, newLog, function(error) {
            if (error) {
              return Logfile.handleError(error);
            }
          });
        };
      })(this));
    };

    Logfile.prototype.createLog = function() {
      if (!Logfile.isFile(this.logfile)) {
        return Logfile.touch(this.logfile, function(error) {
          if (error) {
            return Logfile.handleError(error);
          }
        });
      }
    };

    return Logfile;

  })(EventEmitter);

}).call(this);
