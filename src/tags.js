(function() {
  var Record, Tag, Tags, _;

  Record = require('./record');

  Tag = require('./tag');

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
            tags: Tag.stringify(record.tags)
          });
        }
      });
      return data;
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

    Tags.prototype.getTree = function() {
      var getDepth, handleTag, makeTag, tagHasChildren, tree;
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
        var childrenWithChildren, depthArray;
        if (depthSoFar == null) {
          depthSoFar = 1;
        }
        if (!tagHasChildren(tag)) {
          return 1;
        } else {
          depthSoFar = depthSoFar + 1;
          childrenWithChildren = _.filter(tag.children, tagHasChildren);
          if (childrenWithChildren.length > 0) {
            depthArray = _.map(childrenWithChildren, function(child) {
              return getDepth(child, depthSoFar);
            });
            return _.max(depthArray) || depthSoFar;
          } else {
            return depthSoFar;
          }
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
      tree = _(this.records).reduce(function(memo, record) {
        _(record.tags).each(function(t) {
          return handleTag(t, memo, true);
        });
        return memo;
      }, []);
      return _.map(tree, function(tag) {
        tag.depth = getDepth(tag);
        return tag;
      });
    };

    return Tags;

  })();

}).call(this);
