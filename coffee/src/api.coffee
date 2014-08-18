
module.exports = (server, tags, pinger) ->
    getLast = (req, res) ->
        res pinger.lst

    # /tags/
    server.route [
        {
            # get time data for single tags
            method: 'GET'
            path: '/api/tag/{name}'
            handler: (req, res) ->
                n = req.params.name
                res tags.getTimeDataFor n
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
