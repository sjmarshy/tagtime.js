module.exports = (server) ->
    server.route
        method: 'GET'
        path: '/{param*}'
        handler:
            directory:
                path: 'public'
                index: true
                defaultExtension: 'html'
