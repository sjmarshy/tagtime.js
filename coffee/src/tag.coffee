_  = require 'underscore'

module.exports =
    class Tag
        @stringify: (tagArray) ->
            return _(tagArray).map (t) ->
                return t.tag
        constructor: (@tag) ->
            @split = @tag.split(':')
        first: ->
            return @split[0]

        rest: ->
            return @split.slice 1

        last: ->
            return @split[@split.length - 1]

        contains: (search) ->
            return (@tag.indexOf(search) != -1)

        hasChildren: ->
            return (@split.length > 1)


