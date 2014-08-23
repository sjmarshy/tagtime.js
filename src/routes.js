(function() {
  module.exports = function(server) {
    return server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: 'public',
          index: true,
          defaultExtension: 'html'
        }
      }
    });
  };

}).call(this);
