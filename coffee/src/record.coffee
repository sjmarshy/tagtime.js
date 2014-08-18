_   = require 'underscore'

module.exports =
    # Record will represent the information gathered by a single ping.
    class Record
        constructor: (@time = 0, tagString) ->
            @tags = _(tagString.split(',')).map (tag) ->
                return tag.trim()

        getTopLevelTags: ->
            return _(@tags).map (tag) ->
                return tag.split(':')[0]

        doesContainTag: (name) ->
            answer = false
            _(@tags).each (tag) ->
                if tag.indexOf(name) != -1
                    answer = true
            return answer
