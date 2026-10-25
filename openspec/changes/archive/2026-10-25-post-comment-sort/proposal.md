# Comment Sort

## Why

The feed has a Sort by select (Hot, New, Top) over one `post.readPosts` procedure, and comments are read through the same procedure but keep a fixed sort: always the stored hot score. On a thread of any length that hides the newest reply under older well-liked ones, and there is no way to read a conversation in the order it happened. Reddit puts a comment sort directly above every thread, defaulting to its ranked order and offering Top, New and Old beside it.

## What Changes

Add a Sort by control to the comments of a post, with Hot, Top, New and Old, so a reader can choose the order a thread is read in.

- A Sort by control at the head of the Comments section on a post, with four options: Hot (today's order), Top, New and Old.
- The chosen sort applies to every open reply branch of the thread, not only the top level. Changing it re-reads each open branch from its first page; replies a reader had expanded stay expanded.
- Old is a thread order only: the feed's Sort by keeps offering Hot, New and Top.
- The sort is per visit and is not persisted: opening another post starts at Hot, as the feed does.
- No Best, Controversial or Q&A sort is added. Best and Controversial need up and down vote counts kept apart, which the model does not carry; Q&A needs an author-reply signal the model does not carry.

## Capabilities

- **post/comment-sort** (new)

## Waiting on

None.

## Impact

- The post page's comments section gains the Sort by control.
- The sort options shared by the feed and the comments gain Old, with its own mark in the icon map.
- The comment state holds the chosen sort and clears the loaded replies on a change.
- The composable that reads comments passes the chosen sort to each branch's read.
- The feed's Sort by control is unchanged.
