# TagTime.js

a node.js based implementation of [TagTime](https://github.com/dreeves/tagtime)
that will replicate the timing, pinging and recording functionality - electing
to store the output in a JSON format, rather than the plain text format of the
original Perl version. 

This will also allow us to do awesome things like set up a local server to
display stats and charts and graphs about your time, enabling you to track
everything.
## Installation

### Requirements

this has only been tested on osX

* node.js
* gvim

### Instructions

once node and gvim is installed, download this repositiory and 

```
node index.js
```

in the project directory. After the first ping  `log.json` will be written in the project root. This will contain
a JSON string with timestamps as keys and the tags as values. 


### Now What?

Once it's up and running, an evim window will pop up every now and again. In
these files, comments are added by starting a line with a `#` character, and
the time of the ping will be provided for you as a comment initially. For now,
the tags are plaintext and no processing is done on them, besides adding them
to a `log.json` in the project root which will contain an object keyed with
timestamps. 

Eventually this program will also perform the analysis on this information, as
well as providing it in a multitude of ways. For now, ideas about how I wish to
handle tags in the future are held in the [docs](docs/tags.md)
