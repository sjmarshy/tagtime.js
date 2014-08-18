moment = require 'moment'
_ = require 'underscore'

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

    # /misc/
    server.route [
        {
            method: 'GET'
            path: '/api/today'
            handler: (req, res) ->
                midnight = moment().hour(0).minute(0).second 0
                res tags.getAllAfter midnight.unix()
        }
        {
            method: 'GET'
            path: '/api/today/human'
            handler: (req, res) ->
                midnight = moment().hour(0).minute(0).second 0
                t = tags.getAllAfter midnight.unix()

                res _(t).map (tag) ->
                    tnew =
                        time: moment.unix(tag.time).format('ddd, hA')
                        tags: tag.tags
                    return tnew
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
