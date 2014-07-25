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

## First Steps

First, I think we need to get the timing algorythm down. I need to do a fair
bit of reading through perl source (an unfamiliar language to me) and a little
reading on the theory around tagtime to determine the best way to implement
this in javascript. Once we have a reliable, configurable pinger then we can
move forward
