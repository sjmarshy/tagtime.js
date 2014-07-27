# TagTime.js

a node.js based implementation of [TagTime](https://github.com/dreeves/tagtime)
that will replicate the timing, pinging and recording functionality - electing
to store the output in a JSON format, rather than the plain text format of the
original Perl version. 

This will also allow us to do awesome things like set up a local server to
display stats and charts and graphs about your time, enabling you to track
everything.

We can also implement a git-like temporary file that is opened by the text
editor to insert your tags into. This will allow for a custom message, and also
custom top-level tags that the user will be prompted to fill in (to allow you
to set tags like 'location:' 'task:' 'project:' etc that you can fill in and
get a little more context about your tags 

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

in the project directory. After the first ping (you will need to exit gvim
entirely) `log.json` will be written in the project root. This will contain
a JSON string with timestamps as keys and the tags as values. 

Tags will eventually be comma-separated, and scope will be defined with
a colon. For example:

```
task:writing:readme, work:personal:tagtime.js
```
is what I would write if I had been 'pinged' during writing this - denoting
I was performing a task, which involved writing, and the thing I was writing
was a readme. This information is not currently used, but it will be eventually
