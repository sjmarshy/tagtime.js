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
    var sortedTags = reverseArrayDestructive(_.sortBy(data, 'count'));
    var numberOfTags = sortedTags.length;

    var tags = d3.select('body').selectAll('div')
        .data(sortedTags);

    tags.enter().append('div');

    tags
        .classed('tag', true)
        .text(getTagName)
        .style({
            height: '60px',
            float: 'left',
            margin: '0.5%',
            color: 'white',
            'text-align': 'center',
            'line-height': '60px'
        })
        .style('width', function () {
            if (numberOfTags % 2 === 0) {
                return "49%";
            } else if (numberOfTags % 3 === 0) {
                return "33%";
            } else {
                return "25%";
            }
        })
        .style('background', function () {
            return "#" + hexColorsLoop();
        })
        .attr('title', function (tag) {
            return tag.count;
        });

    tags.exit().remove();

    tags.each(function () {
        console.log(this);
    });
});


