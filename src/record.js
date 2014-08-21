(function() {
  var Record, Tag, _;

  Tag = require('./Tag');

  _ = require('underscore');

  module.exports = Record = (function() {
    function Record(time, tagString) {
      this.time = time != null ? time : 0;
      this.tags = _(tagString.split(',')).map(function(tag) {
        return new Tag(tag.trim());
      });
    }

    Record.prototype.getTopLevelTags = function() {
      return _(this.tags).map(function(tag) {
        return tag.first();
      });
    };

    Record.prototype.doesContainTag = function(name) {
      var answer;
      answer = false;
      _(this.tags).each(function(tag) {
        if (tag.contains(name)) {
          return answer = true;
        }
      });
      return answer;
    };

    return Record;

  })();

}).call(this);
