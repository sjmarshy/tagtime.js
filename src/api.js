(function() {
  module.exports = function(server, logfile, pinger) {
    var getLast;
    getLast = function(req, res) {
      return res(pinger.lst);
    };
    server.route([
      {
        method: 'GET',
        path: '/api/tags/popularity',
        handler: function(req, res) {
          return res(logfile.getMostPopular());
        }
      }, {
        method: 'GET',
        path: '/api/tags',
        handler: function(req, res) {
          return res(logfile.getTagsAsTree());
        }
      }, {
        method: 'GET',
        path: '/api/tags/flat',
        handler: function(req, res) {
          return res(logfile.getTagsAsUniqueList());
        }
      }, {
        method: 'GET',
        path: '/api/tags/flat/raw',
        handler: function(req, res) {
          return res(logfile.getTagsAsList());
        }
      }, {
        method: 'GET',
        path: '/api/tags/detail',
        handler: function(req, res) {
          return res(logfile.getTagsAsDetailTree());
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
