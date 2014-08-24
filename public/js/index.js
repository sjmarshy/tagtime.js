var d3 = require('../bc/d3/d3.js');
var $  = require('../bc/jquery/dist/jquery.js');
var _  = require('underscore');

var hexColors = [
    '2BCAF0',
    'FF35B0',
    '8BE841'
];

var loopArray = function (array) {
    var len = array.length;
    var cnt = -1;
    return function () {
        cnt++;
        if (cnt >= len) {
            cnt = 0;
        }
        return array[cnt];
    };
};

var hexColorsLoop = loopArray(hexColors);

var reverseArrayDestructive = function (array) {
    var newArray = [];
    var len      = array.length;
    for (i = 0; i < len; i++) {
        newArray.push(array.pop());
    }
    return newArray;
};

var getTagName = function (tag) {
    return tag.tag;
};

$.get('/api/tag/top', function(data) {
    var sortedTags    = reverseArrayDestructive(_.sortBy(data, 'count'));
    var numberOfTags  = sortedTags.length;
    var padding       = 10;
    var headTagHeight = 60;

    var page = d3.select('svg').selectAll('rect')
        .data(sortedTags);
    

    var tags = page.enter().append('rect');

    tags
        .classed('tag', true)
        .attr('height', function (d) {
            console.log(d);
            return headTagHeight;
        })
        .attr('width', 300) 
        .attr('transform', function (tag, i) {
            return "translate(0," + ((i * headTagHeight) + (i * padding))  + ")";
        })
        .attr('title', function (tag) {
            return tag.count;
        });

    page.exit().remove();
});


