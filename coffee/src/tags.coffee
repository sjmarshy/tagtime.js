Record = require './record'
Tag    = require './tag'
Moment = require 'moment'
_      = require 'underscore'

module.exports =
    class Tags
        constructor: (logfile) ->
            constructRecords = (data) ->
                return _(data).map (tags, time) ->
                    return new Record time, tags

            unless logfile.data
                logfile.on 'read', (data) =>
                    @records = constructRecords data
            else
                @records = constructRecords logfile.data

            logfile.on 'ping', (time, tags) =>
                @records.push new Record time, tags


        getSpan: ->
            f = @records[0]
            l = @records[@records.length - 1]

            console.log Moment.unix(f.time).format('d/M/YYYY')
            return Moment.duration(l.time - f.time, 's').asMinutes()


        getTimeDataFor: (tagname) ->
            data = []
            _(@records).each (record) ->
                if record.doesContainTag tagname
                    data.push
                        time: record.time
                        tags: Tag.stringify(record.tags)
            return data


        getTimeTotalFor: (tagname) ->
            tags = _.map @records, (record) ->
                return {
                    time: record.time
                    tags: Tag.stringify(record.tags)
                }

            inOrder = orderTags tags

            singleTags = _.map inOrder, (tag) ->
                return {
                    tag: tag.tags[0]
                    time: tag.time
                }

            times = getTimes singleTags

            return _.chain(times).filter (tag) ->
                return (tag.tag.search(new RegExp(tagname)) > -1)
            .reduce (memo, tag) ->
                memo += tag.duration
                return memo
            , 0
            .value()


        getAfter: (tagname, unixTimestamp) ->
            t = @getTimeDataFor(tagname)
            return _.filter t, (ts) ->
                return ts.time > unixTimestamp

        getAfterMidnight: (tagname) ->
            midnight = getMidnight()
            return @getAfter tagname, midnight


        getAllAfter: (unixTimestamp) ->
            return _.chain(@records).filter (rec) ->
                return rec.time > unixTimestamp
            .map (rec) ->
                return {
                    tags: Tag.stringify rec.tags
                    time: rec.time
                }
            .value()

        getAllAfterMidnight: ->
            midnight = getMidnight()
            return this.getAllAfter midnight

        getTimesAfterMidnight: ->
            tags = @getAllAfterMidnight()
            inOrder = orderTags tags

            singleTags = _.map inOrder, (tag) ->
                return {
                    tag: tag.tags[0]
                    time: tag.time
                }

            return getTimes singleTags

        getTree: ->
            makeTag = (tag, top) ->
                return {
                    tag: tag
                    count: 1
                    children: []
                    childCount: 0
                    depth: 1
                    topLevel: top
                }

            tagHasChildren = (tag) ->
                if tag.childCount == 0
                    return false
                else
                    return true

            getDepth = (tag, depthSoFar) ->
                unless tagHasChildren tag
                    return 0
                else
                    childrenWithChildren = _.filter(
                        tag.children,
                        tagHasChildren)
                    depth = ((depthSoFar || 1)
                    + getDepth _.filter(childrenWithChildren, tagHasChildren)
                    )
                    return depth




            handleTag = (tag, memo, top, parent) ->
                exists = _(memo).findWhere
                    tag: tag.first()

                unless exists
                    exists =  makeTag tag.first(), top
                    memo.push exists

                    if parent
                        parent.childCount++
                        parent.children.push exists
                else
                    exists.count++


                if tag.hasChildren()
                    handleTag new Tag(tag.rest().join(':')), memo, false, exists
                else
                    return memo

            return _(@records).reduce (memo, record) ->
                _(record.tags).each (t) ->
                    handleTag t, memo, true
                return memo
            , []


getMidnight = ->
    return Moment().hour(0).minute(0).second(0).unix()

orderTags = (tags) ->
    return _.sortBy tags, 'time'

setDuration = (timeTag) ->
    timeTag.duration = Moment
    .duration(parseInt(timeTag.end) - parseInt(timeTag.start), 's')
    .asMinutes()

# returns {
#   tag: name
#   start: start-time
#   end: end-time
#   duration: secs
#   }
getTimes = (tags) ->
    inOrder = orderTags tags

    _.reduce inOrder, (memo, tag) ->
        len = memo.length
        if len > 0
            last = memo[len - 1]
            if last.tag == tag.tag
                last.end = tag.time
            else
                difference = (parseInt(tag.time) - parseInt(last.end)) / 2
                last.end = parseInt(last.end) + parseInt(difference)
                newTag =
                    tag: tag.tag
                    start: parseInt(tag.time) - difference
                    end: parseInt(tag.time)

                setDuration newTag
                memo.push newTag

            setDuration last
            return memo

        else
            memo.push
                tag: tag.tag
                start: tag.time
                end: tag.time
                duration: 20

            return memo
    , []





