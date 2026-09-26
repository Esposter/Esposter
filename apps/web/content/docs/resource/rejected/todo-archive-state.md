---
title: Todo archive state
description: Rejected — an Archived state or tab between completing a todo and deleting it; the Completed section already is the archive, and a third state is a second place for the same finished item.
---

# Todo Archive State

The idea was a three-step life for a todo: complete it, move it to an archive tab, and delete it from there only when it has to go — with the archive showing when each was completed.

## Why not

[Completion](/docs/proposals/resource/todo-list/completion) already gives every finished todo that home. The Completed section at the foot of the list keeps each one with the date it was done, un-ticks back to open in place, and collapses out of the way when the reader wants only what is left. An archive would hold exactly the same items with exactly the same date, so the only thing it adds is a decision on every finished task — archive it or leave it — and a second place to look for it. Microsoft To Do and Todoist both keep completed tasks in the list they came from for the same reason.

Deletion is not made safer by a middle state either: it lives in the task's own dialog and behind a confirmed **Delete completed**, and the resource's version history recovers a list's earlier content.
