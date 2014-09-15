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
            # total time tagged - from first tag to last
            # in minutes
            path: '/api/time'
            handler: (req, res) ->
                res tags.getSpan()
        }
        {
            method: 'GET'
            path: '/api/time/{name}'
            handler: (req, res) ->
                n = req.params.name
                res tags.getTimeTotalFor n
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
                name    = req.params.name
                tagList = tags.getTimesAfterMidnight()
                namedTags = _.filter tagList, (tag) ->
                    return (tag.tag.search(new RegExp(name)) > -1)

                res _.reduce namedTags, (memo, tag) ->
                    memo += tag.duration
                    return memo
                , 0
        }
        {
            method: 'GET'
            path: '/api/today/time'
            handler: (req, res) ->
                res tags.getTimesAfterMidnight()
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
