Record = require './record'
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
                        tags: record.tags
            return data

        getAllAfter: (unixTimestamp) ->
            return _(@records).filter (rec) ->
                return rec.time > unixTimestamp

