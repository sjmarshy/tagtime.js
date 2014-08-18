(function() {
  var Tag, _;

  _ = require('underscore');

  module.exports = Tag = (function() {
    Tag.stringify = function(tagArray) {
      return _(tagArray).map(function(t) {
        return t.tag;
      });
    };

    function Tag(tag) {
      this.tag = tag;
      this.split = this.tag.split(':');
    }

    Tag.prototype.first = function() {
      return this.split[0];
    };

    Tag.prototype.rest = function() {
      return this.split.slice(1);
    };

    Tag.prototype.last = function() {
      return this.split[this.split.length - 1];
    };

    Tag.prototype.contains = function(search) {
      return this.tag.indexOf(search) !== -1;
    };

    Tag.prototype.hasChildren = function() {
      return this.split.length > 1;
    };

    return Tag;

  })();

}).call(this);
