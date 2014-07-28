# Tags

I have a few ideas about how I want tags to work.

## Making New Tags, Remembering Old Tags

Like most tagging systems, new tags will be made on the fly - simply include a tag,
and it will be used. However, in my personal experience this can make it tricky to
organise, as you forget pretty easily the exact word you use for your tag. Some
systems, such as those employed on various popular websites, try and circumvent this
problem by providing an interface that suggests tags as you type them. As we'll
be using vim as a default editor, and I'm not familiar enough with vim to know how
to provide auto-suggestions, I think that we can simply analyse the most popular tags
and provide a few hints as comments in the tempfile that opens when a new ping is
due.

## Tag Tree

When tagging, context is everything. I believe a very basic tag heirarchy would make
this simpler - especially when kept pretty optional. This would allow for a system
where one had 'top-level' tags, which provide the context for any 'child' tags they
would have - if any.

Example of 'top-level' tags may be `work`, `read` or `play`. You would then provide
more detail for these with 'child' tags, initiated with a colon and separated by
a semi-colon. We would begin to see patterns such as:

`work:docs; project:tagtime, reading:docs:tagtime`

Here, the tree would look like this, with the comma creating separate trees:

```text

   work              reading
    /  \               |
  docs project       docs
        \              |
       tagtime       tagtime
```

I am unsure about the exact semantics of this. using the previous example, how would
one add something to the work tree after the `project:tagtime` section? Would they
add a semi-colon and remove the possibility of more than one child for the `work:project`
tag, or do we use one semi-colon to go up one step in the heirarchy?

The second aproach adds more power, but will look unwieldly, and will add cognitive
load to the process of adding tags.

ultimately, I would like simplicity to rule, and a system like the following may win
out:

`work:docs, work:project:tagtime, work:project:personal, reading:docs:tagtime`

Here, each repeated tag would only be counted once, creating a tree the same as the
previous diagram. This would add the power lost and remove the problems of cognitive
load and a more complex language - and leaves the number of symbols required to the
fairly intuitive : and , (at least, intuitive for people who have used tagging systems
previously.
