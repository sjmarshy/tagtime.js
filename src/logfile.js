(function() {
  var Logfile, Record, fs, q, _;

  Record = require('./record');

  fs = require('fs');

  q = require('q');

  _ = require('underscore');

  module.exports = Logfile = (function() {
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
      this.buildRecords();
    }

    Logfile.prototype.buildRecords = function() {
      return Logfile.read(this.logfile, (function(_this) {
        return function(log) {
          return _this.records = _(log).map(function(tags, time) {
            return new Record(time, tags);
          });
        };
      })(this));
    };

    Logfile.prototype.writeLog = function(data, now) {
      return Logfile.read(this.logfile, (function(_this) {
        return function(log) {
          var newLog;
          log[now] = data;
          newLog = JSON.stringify(log);
          return Logfile.write(_this.logfile, newLog, function(error) {
            if (error) {
              return Logfile.handleError(error);
            } else {
              return _this.buildRecords();
            }
          });
        };
      })(this));
    };

    Logfile.prototype.getTagsAsTree = function() {
      var tagTree, walk;
      tagTree = {};
      walk = function(tag, tree) {
        var n, t;
        n = tag.name;
        if (!tree[n]) {
          tree[n] = {};
        }
        t = tree[n];
        if (tag.children && tag.children.length > 0) {
          return _(tag.children).each(function(child) {
            return walk(child, t);
          });
        } else {
          return t = null;
        }
      };
      _(this.records).each(function(r) {
        if (r.tags && r.tags.length > 0) {
          return _(r.tags).forEach(function(tag) {
            return walk(tag, tagTree);
          });
        }
      });
      return tagTree;
    };

    Logfile.prototype.getTagsAsDetailTree = function() {
      var counts, detailTree, tree;
      detailTree = {};
      counts = this.getMostPopular();
      return tree = this.getTagsAsTree();
    };

    Logfile.prototype.getTagsAsList = function() {
      return _.chain(this.records).map(function(r) {
        return r.getTags();
      }).flatten().compact().value();
    };

    Logfile.prototype.getTagsAsUniqueList = function() {
      return _.chain(this.records).map(function(r) {
        return r.getTags();
      }).flatten().compact().uniq().value();
    };

    Logfile.prototype.getMostPopular = function() {
      return this.count(this.getTagsAsList());
    };

    Logfile.prototype.count = function(arr) {
      var count;
      count = {};
      _(arr).each(function(e) {
        if (count[e]) {
          return count[e]++;
        } else {
          return count[e] = 1;
        }
      });
      return count;
    };

    Logfile.prototype.getMostPopularTopLevel = function() {
      var count, sorted, tags;
      count = {};
      tags = _(this.records).map(function(r) {
        return r.getTopLevelTags();
      });
      sorted = _.chain(tags).flatten().sortBy(function(t) {
        return t;
      }).map(function(t) {
        return t.trim();
      }).value();
      return this.count(tags);
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

  })();

}).call(this);
