
module.exports = (server, logfile, pinger) ->
    getLast = (req, res) ->
        res pinger.lst

    # /tags/
    server.route [
        {
            method: 'GET'
            path: '/api/tags/popularity'
            handler: (req, res) ->
                res logfile.getMostPopular()
        }
        {
            method: 'GET'
            path: '/api/tags'
            handler: (req, res) ->
                res logfile.getTagsAsTree()
        }
        {
            method: 'GET'
            path: '/api/tags/flat'
            handler: (req, res) ->
                res logfile.getTagsAsUniqueList()
        }
        {
            method: 'GET'
            path: '/api/tags/flat/raw'
            handler: (req, res) ->
                res logfile.getTagsAsList()
        }
        {
            method: 'GET'
            path: '/api/tags/detail'
            handler: (req, res) ->
                res logfile.getTagsAsDetailTree()
        }
    ]

    # /time/
    server.route [
        {
            method: 'GET'
            path: '/api/time/prev'
            handler: getLast
        }
        {
            method: 'GET'
            path: '/api/time/last'
            handler: getLast
        }
        {
            method: 'GET'
            path: '/api/time/next'
            handler: (req, res) ->
                res pinger.nxt
        }
    ]

    server.start()
