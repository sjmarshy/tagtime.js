# TagTime.js

a node.js based implementation of [TagTime](https://github.com/dreeves/tagtime).

The big idea is to actively poll you for what you're doing, so rather than you having
to work out how long you spend doing things and insert them into a program, or having
to remember to hit a 'start task' and 'finish task' button whenever you begin or stop
doing something, instead you can just get on with it. You leave this program running,
and every now and again (how often is based on chance and a config file) it will ask
you what you're doing by popping open a text editor. You type in some tags and save
the file, and it'll store them. You can then query the tags using the programs
internal server, currently by use of an api but before long I'll be adding a
web-based front-end.

The audience of this program is essentially me. At first, I thought it would be
useful for work - I could find out how long I actually spend on particular projects,
but then I thought about it some more - you could track anything. Anyone interested
in Quantified Self, or anyone who wants to track mood, or what they last ate at any
point in the day, or even just how long they spend on the computer. It could be used
to track how long is spent on client work also - the time is divided into the chunks
given in the config file which can be misleading for small chunks of time, but over
longer periods it becomes more accurate - especially as it's truly a random sample of
time given.

The project is heavily in development, I'm still changing how things work all the
time, and not everything will work - just so you know.



## Installation

### Requirements

this has only been tested on OS X but it really should be fine on anything that runs
node and gvim.

the plan is to make the editor it uses configurable - it just so happens that
I'm a vim user.

* node.js
* gvim

### Instructions

excuse the sparse docs, I'll try and build them up over time.

once node and gvim is installed, download this repositiory with

```
git clone https://github.com/sjmarshy/tagtime.js
```
`cd tagtime.js` into the directory and execute:

```
node index.js
```

When the program 'pings', a text editor will appear. You enter your tags into the
editor and both save and exit the editor to complete the process. Tags are comma
separeated, but an extra dimension can be added with scope. for example, if you need
to track both when you are working in general, and the project you are working on,
then you can type `work:project-003` and `project-003` will show as a subset of
`work`. This can be used to specify things like that you are browsing the web and the
site you're on (`web:github.com`) or your mood at the time of the ping (`mood:3`),
but ultimately it's up to you - the system makes no assumptions about the data, only
how it's presented.

you can add comments by starting a line with a #, but it must be at the beginning of
the line, even a space infront of it will mess it up - I don't parse the file very
well at the moment.

After the first ping  `log.json` will be written in the project root. This will 
contain a JSON string with timestamps as keys and the tags as values. The server will
run at http://localhost:3891 and there's currently a limited and JSON only API. if
you want, for example, to see every tag containing `work`, you can enter the
following in your browser while the program is running:

```
http://localhost:3891/api/tag/work
```
and a string will appear showing you every occurance of the word work in your
records. The plan is to use this information to show you graphically all the
information about yourself and how you spend your time that you could ever want.

* `GET /api/tag/<tagname>` - get time series data for a named tag
* `GET /api/tag/tree`      - fetch all tags displayed in a tree
* `GET /api/tag/top`       - fetch only the top of the tree - in `/tree/` every
  single tag will be included at the root level of the tree, although heirarchy is
  still shown for each individual tag. This way, the non 'top level' tags are only
  shown as children of the root tags. If that makes no sense, I apologise.
* `GET /api/today`         - show the tags entered today
* `GET /api/today/human`   - show the tags entered today, with the timestamps
  processed to show as human readable
* `GET /api/time/prev`     - fetch the timestamp for the last ping, alias `GET
  /api/time/last`
* `GET /api/time/next`     - fetch the timestamp for the next ping. Kind of cheating,
  as strictly speaking you shouldn't know when it pings, but it's your time after
  all.

