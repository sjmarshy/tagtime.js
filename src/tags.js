(function() {
  var Moment, Record, Tag, Tags, getMidnight, getTimes, orderTags, setDuration, _;

  Record = require('./record');

  Tag = require('./tag');

  Moment = require('moment');

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

    Tags.prototype.getSpan = function() {
      var f, l;
      f = this.records[0];
      l = this.records[this.records.length - 1];
      console.log(Moment.unix(f.time).format('d/M/YYYY'));
      return Moment.duration(l.time - f.time, 's').asMinutes();
    };

    Tags.prototype.getTimeDataFor = function(tagname) {
      var data;
      data = [];
      _(this.records).each(function(record) {
        if (record.doesContainTag(tagname)) {
          return data.push({
            time: record.time,
            tags: Tag.stringify(record.tags)
          });
        }
      });
      return data;
    };

    Tags.prototype.getTimeTotalFor = function(tagname) {
      var inOrder, singleTags, tags, times;
      tags = _.map(this.records, function(record) {
        return {
          time: record.time,
          tags: Tag.stringify(record.tags)
        };
      });
      inOrder = orderTags(tags);
      singleTags = _.map(inOrder, function(tag) {
        return {
          tag: tag.tags[0],
          time: tag.time
        };
      });
      times = getTimes(singleTags);
      return _.chain(times).filter(function(tag) {
        return tag.tag.search(new RegExp(tagname)) > -1;
      }).reduce(function(memo, tag) {
        memo += tag.duration;
        return memo;
      }, 0).value();
    };

    Tags.prototype.getAfter = function(tagname, unixTimestamp) {
      var t;
      t = this.getTimeDataFor(tagname);
      return _.filter(t, function(ts) {
        return ts.time > unixTimestamp;
      });
    };

    Tags.prototype.getAfterMidnight = function(tagname) {
      var midnight;
      midnight = getMidnight();
      return this.getAfter(tagname, midnight);
    };

    Tags.prototype.getAllAfter = function(unixTimestamp) {
      return _.chain(this.records).filter(function(rec) {
        return rec.time > unixTimestamp;
      }).map(function(rec) {
        return {
          tags: Tag.stringify(rec.tags),
          time: rec.time
        };
      }).value();
    };

    Tags.prototype.getAllAfterMidnight = function() {
      var midnight;
      midnight = getMidnight();
      return this.getAllAfter(midnight);
    };

    Tags.prototype.getTimesAfterMidnight = function() {
      var inOrder, singleTags, tags;
      tags = this.getAllAfterMidnight();
      inOrder = orderTags(tags);
      singleTags = _.map(inOrder, function(tag) {
        return {
          tag: tag.tags[0],
          time: tag.time
        };
      });
      return getTimes(singleTags);
    };

    Tags.prototype.getTree = function() {
      var getDepth, handleTag, makeTag, tagHasChildren;
      makeTag = function(tag, top) {
        return {
          tag: tag,
          count: 1,
          children: [],
          childCount: 0,
          depth: 1,
          topLevel: top
        };
      };
      tagHasChildren = function(tag) {
        if (tag.childCount === 0) {
          return false;
        } else {
          return true;
        }
      };
      getDepth = function(tag, depthSoFar) {
        var childrenWithChildren, depth;
        if (!tagHasChildren(tag)) {
          return 0;
        } else {
          childrenWithChildren = _.filter(tag.children, tagHasChildren);
          depth = (depthSoFar || 1, +getDepth(_.filter(childrenWithChildren, tagHasChildren)));
          return depth;
        }
      };
      handleTag = function(tag, memo, top, parent) {
        var exists;
        exists = _(memo).findWhere({
          tag: tag.first()
        });
        if (!exists) {
          exists = makeTag(tag.first(), top);
          memo.push(exists);
          if (parent) {
            parent.childCount++;
            parent.children.push(exists);
          }
        } else {
          exists.count++;
        }
        if (tag.hasChildren()) {
          return handleTag(new Tag(tag.rest().join(':')), memo, false, exists);
        } else {
          return memo;
        }
      };
      return _(this.records).reduce(function(memo, record) {
        _(record.tags).each(function(t) {
          return handleTag(t, memo, true);
        });
        return memo;
      }, []);
    };

    return Tags;

  })();

  getMidnight = function() {
    return Moment().hour(0).minute(0).second(0).unix();
  };

  orderTags = function(tags) {
    return _.sortBy(tags, 'time');
  };

  setDuration = function(timeTag) {
    return timeTag.duration = Moment.duration(parseInt(timeTag.end) - parseInt(timeTag.start), 's').asMinutes();
  };

  getTimes = function(tags) {
    var inOrder;
    inOrder = orderTags(tags);
    return _.reduce(inOrder, function(memo, tag) {
      var difference, last, len, newTag;
      len = memo.length;
      if (len > 0) {
        last = memo[len - 1];
        if (last.tag === tag.tag) {
          last.end = tag.time;
        } else {
          difference = (parseInt(tag.time) - parseInt(last.end)) / 2;
          last.end = parseInt(last.end) + parseInt(difference);
          newTag = {
            tag: tag.tag,
            start: parseInt(tag.time) - difference,
            end: parseInt(tag.time)
          };
          setDuration(newTag);
          memo.push(newTag);
        }
        setDuration(last);
        return memo;
      } else {
        memo.push({
          tag: tag.tag,
          start: tag.time,
          end: tag.time,
          duration: 20
        });
        return memo;
      }
    }, []);
  };

}).call(this);
