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
                    depth: 1
                    topLevel: top
                }

            tagHasChildren = (tag) ->
                if tag.childCount == 0
                    return false
                else
                    return true

            getDepth = (tag, depthSoFar = 1) ->
                unless tagHasChildren tag
                    return 1
                else
                    depthSoFar = depthSoFar + 1

                    childrenWithChildren = _.filter(
                        tag.children,
                        tagHasChildren)

                    if childrenWithChildren.length > 0
                        depthArray = _.map childrenWithChildren, (child) ->
                            return getDepth child, depthSoFar

                        return _.max(depthArray) || depthSoFar
                    else
                        return depthSoFar

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

            tree =  _(@records).reduce (memo, record) ->
                _(record.tags).each (t) ->
                    handleTag t, memo, true
                return memo
            , []

            return _.map tree, (tag) ->
                tag.depth = getDepth tag
                return tag


