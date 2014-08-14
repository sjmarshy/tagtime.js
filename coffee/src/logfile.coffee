Record = require './record'
fs     = require 'fs'
q      = require 'q'
_      = require 'underscore'

module.exports =
    class Logfile
        @handleError: (error) ->
            console.error error
            process.exit 1
        @touch: (fname, done) ->
            fs.open fname, 'w', (error, fd) ->
                if error
                    done new Error('unable to create tmpfile')
                else
                    fs.close fd, done

        @isFile: (fname) ->
            return fs.existsSync fname

        @write: (fname, data, done) ->
            fs.writeFile fname, data, (error) ->
                if error
                    done error
                else
                    done()

        @read: (fname, done) ->
            fs.readFile fname, (error, data) ->
                unless error
                    if data.length > 0
                        done JSON.parse data.toString()
                    else
                        done {}
                else
                    Logfile.handleError error

        @stripComments: (data) ->
            lines = data.split '\n'
            newdata = _(lines).reject (l) ->
                return l[0] == '#'

            return newdata.join(' ')

        constructor: (@logfile) ->
            @buildRecords()

        buildRecords: ->
            Logfile.read @logfile, (log) =>
                @records = _(log).map (tags, time) ->
                    return new Record time, tags

        writeLog: (data, now) ->
            Logfile.read @logfile, (log) =>
                log[now] = data

                newLog = JSON.stringify log
                Logfile.write @logfile, newLog, (error) =>
                    if error
                        Logfile.handleError error
                    else
                        @buildRecords()
        getTagsAsTree: ->
            tagTree = {}

            walk = (tag, tree) ->
                n = tag.name

                unless tree[n]
                    tree[n] = {}

                t = tree[n]

                if tag.children && tag.children.length > 0
                    _(tag.children).each (child) ->
                        walk child, t
                else
                    t = null

            _(@records).each (r) ->
                if r.tags && r.tags.length > 0
                    _(r.tags).forEach (tag) ->
                        walk tag, tagTree

            return tagTree

        getTagsAsDetailTree: ->
            detailTree = {}
            counts     = @getMostPopular()
            tree       = @getTagsAsTree()

        getTagsAsList: ->
            _.chain(@records).map (r) ->
                return r.getTags()
            .flatten().compact().value()

        getTagsAsUniqueList: ->
            _.chain(@records).map (r) ->
                return r.getTags()
            .flatten().compact().uniq().value()

        getMostPopular: ->
            return @count @getTagsAsList()

        count: (arr) ->
            count = {}
            _(arr).each (e) ->
                if count[e]
                    count[e]++
                else
                    count[e] = 1

            return count

        getMostPopularTopLevel: ->
            count = {}

            tags = _(@records).map (r) ->
                return r.getTopLevelTags()

            sorted = _.chain(tags).flatten().sortBy (t) ->
                return t
            .map (t) ->
                return t.trim()
            .value()


            return @count tags


        createLog: ->
            unless Logfile.isFile @logfile
                Logfile.touch @logfile, (error) ->
                    if error
                        Logfile.handleError error


