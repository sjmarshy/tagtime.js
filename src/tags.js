(function() {
  var Record, Tags, _;

  Record = require('./record');

  _ = require('underscore');

  module.exports = Tags = (function() {
    function Tags(logfile) {
      var constructRecords;
      constructRecords = function(data) {
        return _(data).map(function(tags, time) {
          return new Record(time, tags);
        });
      };
      if (!logfile.data) {
        logfile.on('read', (function(_this) {
          return function(data) {
            return _this.records = constructRecords(data);
          };
        })(this));
      } else {
        this.records = constructRecords(logfile.data);
      }
      logfile.on('ping', (function(_this) {
        return function(time, tags) {
          return _this.records.push(new Record(time, tags));
        };
      })(this));
    }

    Tags.prototype.getTimeDataFor = function(tagname) {
      var data;
      data = [];
      _(this.records).each(function(record) {
        if (record.doesContainTag(tagname)) {
          return data.push({
            time: record.time,
            tags: record.tags
          });
        }
      });
      return data;
    };

    Tags.prototype.getAllAfter = function(unixTimestamp) {
      return _(this.records).filter(function(rec) {
        return rec.time > unixTimestamp;
      });
    };

    return Tags;

  })();

}).call(this);
