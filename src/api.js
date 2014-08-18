(function() {
  var moment, _;

  moment = require('moment');

  _ = require('underscore');

  module.exports = function(server, tags, pinger) {
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
      }
    ]);
    server.route([
      {
        method: 'GET',
        path: '/api/today',
        handler: function(req, res) {
          var midnight;
          midnight = moment().hour(0).minute(0).second(0);
          return res(tags.getAllAfter(midnight.unix()));
        }
      }, {
        method: 'GET',
        path: '/api/today/human',
        handler: function(req, res) {
          var midnight, t;
          midnight = moment().hour(0).minute(0).second(0);
          t = tags.getAllAfter(midnight.unix());
          return res(_(t).map(function(tag) {
            var tnew;
            tnew = {
              time: moment.unix(tag.time).format('ddd, hA'),
              tags: tag.tags
            };
            return tnew;
          }));
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
