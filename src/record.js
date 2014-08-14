(function() {
  var Record, Tag, _;

  Tag = require('./tag');

  _ = require('underscore');

  module.exports = Record = (function() {
    Record.parseTags = function(tags) {
      var clean_tags, tags_a, tags_a_i;
      clean_tags = tags.trim();
      if (!clean_tags) {
        return null;
      }
      tags_a = clean_tags.split(',');
      tags_a_i = _(tags_a).map(function(t) {
        var heirarchy_a, tag_h_a;
        t = t.trim();
        if (t.indexOf(':') !== -1) {
          heirarchy_a = t.split(':');
          tag_h_a = _(heirarchy_a).reduce(function(memo, value, n, a) {
            var c, getDeepestChild, p;
            getDeepestChild = function(tag) {
              if (tag.children && tag.children[0] && tag.children[0].children) {
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

    Record.prototype.getTags = function() {
      return _.chain(this.tags).map(function(t) {
        return t.getHeirsNames();
      }).flatten().value();
    };

    return Record;

  })();

}).call(this);
