Tag = require './Tag'
_   = require 'underscore'


module.exports =
    # Record will represent the information gathered by a single ping.
    class Record
        constructor: (@time = 0, tagString) ->
            @tags = _(tagString.split(',')).map (tag) ->
                return new Tag tag.trim()

        getTopLevelTags: ->
            return _(@tags).map (tag) ->
                return tag.first()

        doesContainTag: (name) ->
            answer = false
            _(@tags).each (tag) ->
                if tag.contains(name)
                    answer = true

            return answer
