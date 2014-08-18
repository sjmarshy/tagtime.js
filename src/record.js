(function() {
  var Record, _;

  _ = require('underscore');

  module.exports = Record = (function() {
    function Record(time, tagString) {
      this.time = time != null ? time : 0;
      this.tags = _(tagString.split(',')).map(function(tag) {
        return tag.trim();
      });
    }

    Record.prototype.getTopLevelTags = function() {
      return _(this.tags).map(function(tag) {
        return tag.split(':')[0];
      });
    };

    Record.prototype.doesContainTag = function(name) {
      var answer;
      answer = false;
      _(this.tags).each(function(tag) {
        if (tag.indexOf(name) !== -1) {
          return answer = true;
        }
      });
      return answer;
    };

    return Record;

  })();

}).call(this);
