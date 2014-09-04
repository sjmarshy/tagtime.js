(function() {
  var moment, _;

  moment = require('moment');

  _ = require('underscore');

  module.exports = function(server, tags, pinger, config) {
    var getLast;
    getLast = function(req, res) {
      return res(pinger.lst);
    };
    server.route([
      {
        method: 'GET',
        path: '/api/tag/{name}',
        handler: function(req, res) {
          var n;
          n = req.params.name;
          return res(tags.getTimeDataFor(n));
        }
      }, {
        method: 'GET',
        path: '/api/count/tag/{name}',
        handler: function(req, res) {
          var n, t;
          n = req.params.name;
          t = tags.getTimeDataFor(n);
          return res(t.length);
        }
      }, {
        method: 'GET',
        path: '/api/time/tag/{name}',
        handler: function(req, res) {
          var n, t;
          n = req.params.name;
          t = tags.getTimeDataFor(n);
          return res({
            hours: (t.length * config.frequency) / 60
          });
        }
      }, {
        method: 'GET',
        path: '/api/tag/tree',
        handler: function(req, res) {
          return res(tags.getTree());
        }
      }, {
        method: 'GET',
        path: '/api/tag/top',
        handler: function(req, res) {
          return res(_(tags.getTree()).where({
            topLevel: true
          }));
        }
      }, {
        method: 'GET',
        path: '/api/today',
        handler: function(req, res) {
          return res(tags.getAllAfterMidnight());
        }
      }, {
        method: 'GET',
        path: '/api/today/find/{name}',
        handler: function(req, res) {
          return res(tags.getAfterMidnight(req.params.name));
        }
      }, {
        method: 'GET',
        path: '/api/today/count/{name}',
        handler: function(req, res) {
          var tagList;
          tagList = tags.getAfterMidnight(req.params.name);
          return res(tagList.length);
        }
      }, {
        method: 'GET',
        path: '/api/today/time/{name}',
        handler: function(req, res) {
          var tagList;
          tagList = tags.getAfterMidnight(req.params.name);
          return res({
            hours: (tagList.length * config.frequency) / 60
          });
        }
      }, {
        method: 'GET',
        path: '/api/today/human',
        handler: function(req, res) {
          var t;
          t = tags.getAllAfterMidnight();
          return res(_.chain(t).sortBy('time').map(function(tag) {
            var tnew;
            tnew = {
              time: moment.unix(tag.time).format('ddd, HH:mm:ss'),
              tags: tag.tags
            };
            return tnew;
          }).value());
        }
      }
    ]);
    server.route([
      {
        method: 'GET',
        path: '/api/time/prev',
        handler: getLast
      }, {
        method: 'GET',
        path: '/api/time/last',
        handler: getLast
      }, {
        method: 'GET',
        path: '/api/time/next',
        handler: function(req, res) {
          return res(pinger.nxt);
        }
      }
    ]);
    return server.start();
  };

}).call(this);
