(function() {
  var Logger, Record, Tag, fs, _;

  fs = require('fs');

  _ = require('underscore');

  Tag = (function() {
    Tag.makeChild = function(parent, child) {
      parent.children = [];
      return parent.children.push(child);
    };

    function Tag(name, children) {
      this.name = name;
      this.children = children;
    }

    Tag.prototype.getChild = function(name) {
      return _(this.children).map(function(c) {
        if (c.name === name) {
          return c;
        } else {
          return c.getChild(name);
        }
      });
    };

    return Tag;

  })();

  Record = (function() {
    Record.parseTags = function(tags) {
      var clean_tags, tags_a, tags_a_i;
      clean_tags = tags.trim();
      if (!clean_tags) {
        return null;
      }
      tags_a = clean_tags.split(',');
      tags_a_i = _(tags_a).map(function(t) {
        var heirarchy_a, tag_h_a;
        if (t.indexOf(':') !== -1) {
          heirarchy_a = t.split(':');
          tag_h_a = _(heirarchy_a).reduce(function(memo, value, n, a) {
            var c, getDeepestChild, p;
            getDeepestChild = function(tag) {
              if (tag.children[0].children) {
                return getDeepestChild(tag.children[0]);
              } else {
                return tag.children[0] || tag;
              }
            };
            if (!memo.children) {
              p = new Tag(memo);
              c = new Tag(value);
              p.children = [c];
              return p;
            } else {
              t = getDeepestChild(memo);
              t.children = [new Tag(value)];
              return memo;
            }
          });
          return tag_h_a;
        } else {
          return new Tag(t);
        }
      });
      return tags_a_i;
    };

    function Record(time, tags) {
      this.time = time;
      this.tags = Record.parseTags(tags);
    }

    Record.prototype.getTopLevelTags = function() {
      return _(this.tags).map(function(t) {
        return t.name;
      });
    };

    return Record;

  })();

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
      return fs.readFile(fname, function(error, data) {
        if (!error) {
          if (data.length > 0) {
            return done(JSON.parse(data.toString()));
          } else {
            return done({});
          }
        } else {
          return Logger.handleError(error);
        }
      });
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
      this.buildRecords();
    }

    Logger.prototype.buildRecords = function() {
      return Logger.read(this.logfile, (function(_this) {
        return function(log) {
          _this.records = _(log).map(function(tags, time) {
            return new Record(time, tags);
          });
          return _this.getMostPopular();
        };
      })(this));
    };

    Logger.prototype.writeLog = function(data, now) {
      return Logger.read(this.logfile, (function(_this) {
        return function(log) {
          var newLog;
          log[now] = data;
          newLog = JSON.stringify(log);
          return Logger.write(_this.logfile, newLog, function(error) {
            if (error) {
              return Logger.handleError(error);
            } else {
              return _this.buildRecords();
            }
          });
        };
      })(this));
    };

    Logger.prototype.getMostPopular = function() {
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
      _(sorted).each(function(t) {
        if (count[t]) {
          return count[t]++;
        } else {
          return count[t] = 1;
        }
      });
      return count;
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
