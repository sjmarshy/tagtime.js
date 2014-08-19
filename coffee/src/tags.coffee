Record = require './record'
Tag    = require './tag'
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

        getTimeDataFor: (tagname) ->
            data = []
            _(@records).each (record) ->
                if record.doesContainTag tagname
                    data.push
                        time: record.time
                        tags: Tag.stringify(record.tags)
            return data

        getAllAfter: (unixTimestamp) ->
            return _.chain(@records).filter (rec) ->
                return rec.time > unixTimestamp
            .map (rec) ->
                return {
                    tags: Tag.stringify rec.tags
                    time: rec.time
                }
            .value()

        getTree: ->
            makeTag = (tag, top) ->
                return {
                    tag: tag
                    count: 1
                    children: []
                    childCount: 0
                    topLevel: top
                }

            makeChild = (tagObj, child) ->
                tagObj.childCount++
                tagObj.children.push child
                return tagObj

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


