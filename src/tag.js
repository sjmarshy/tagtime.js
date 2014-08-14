(function() {
  var Tag, _;

  _ = require('underscore');

  module.exports = Tag = (function() {
    Tag.makeChild = function(parent, child) {
      parent.children = [];
      return parent.children.push(child);
    };

    function Tag(name, children) {
      this.name = name;
      this.children = children;
      if (!this.children) {
        this.children = [];
      }
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

    Tag.prototype.getDirectHeirs = function() {
      return this.children;
    };

    Tag.prototype.getDirectHeirsNames = function() {
      return _(this.children).map(function(c) {
        return c.name;
      });
    };

    Tag.prototype.getHeirs = function() {
      var heirs, walk;
      heirs = [];
      walk = function(tag) {
        heirs.push(tag);
        return _(tag.getDirectHeirs()).each(function(c) {
          return walk(c);
        });
      };
      _(this.children).each(function(c) {
        return walk(c);
      });
      return _(heirs).flatten();
    };

    Tag.prototype.getHeirsNames = function() {
      return _(this.getHeirs()).map(function(p) {
        return p.name;
      });
    };

    return Tag;

  })();

}).call(this);
