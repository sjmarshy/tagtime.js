moment = require 'moment'
_ = require 'underscore'

module.exports = (server, tags, pinger, config) ->
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
        {
            method: 'GET'
            path: '/api/count/tag/{name}'
            handler: (req, res) ->
                n = req.params.name
                t = tags.getTimeDataFor n
                res t.length
        }
        {
            method: 'GET'
            path: '/api/time/tag/{name}'
            handler: (req, res) ->
                n = req.params.name
                t = tags.getTimeDataFor n
                res
                    hours: (t.length * config.frequency) / 60
        }
        {
            method: 'GET'
            path:   '/api/tag/tree'
            handler: (req, res) ->
                res tags.getTree()
        }
        {
            method: 'GET'
            path:   '/api/tag/top'
            handler: (req, res) ->
                res _(tags.getTree()).where
                    topLevel: true
        }
        {
            method: 'GET'
            path: '/api/today'
            handler: (req, res) ->
                res tags.getAllAfterMidnight()
        }
        {
            method: 'GET'
            path: '/api/today/find/{name}'
            handler: (req, res) ->
                res tags.getAfterMidnight req.params.name
        }
        {
            method: 'GET'
            path: '/api/today/count/{name}'
            handler: (req, res) ->
                tagList = tags.getAfterMidnight req.params.name
                res tagList.length
        }
        {
            method: 'GET'
            path: '/api/today/time/{name}'
            handler: (req, res) ->
                tagList = tags.getAfterMidnight req.params.name
                res
                    hours: (tagList.length * config.frequency) / 60
        }
        {
            method: 'GET'
            path: '/api/today/human'
            handler: (req, res) ->
                t = tags.getAllAfterMidnight()

                res _.chain(t).sortBy('time').map((tag) ->
                    tnew =
                        time: moment.unix(tag.time).format('ddd, HH:mm:ss')
                        tags: tag.tags
                    return tnew
                ).value()
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
