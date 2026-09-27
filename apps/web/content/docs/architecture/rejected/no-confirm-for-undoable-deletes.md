---
title: No confirm for undoable deletes
description: Rejected — letting a delete the app can undo act on click, with the undo as its only guard, instead of asking first like every other delete.
---

# No confirm for undoable deletes

A delete the app can reverse — a resource into the [recycle bin](/docs/resource/recycle-bin), a sheet's row or column behind the toolbar's Undo — acted on click, and the undo on screen afterwards was its only guard. The reading behind it is NN/g's: a confirmation before a reversible act is friction readers learn to click through, which blunts the confirmations that matter.

## Why not

**Two kinds of delete is a rule a reader has to learn by losing something.** Nothing on a Delete button says which kind it is, so the first time a reader finds out that this one did not ask is the time it already went. A bin restore is a trip to another page, and a sheet's Undo reverses only the latest command, so "undoable" is a claim about the app, not about what the reader can find in the moment.

**One rule is what an enforcer can hold.** "Every delete asks" is a syntax fact — the call lives only in a confirm dialog's `:confirm` — which [`restrictedDeleteSyntaxes`](/docs/architecture/destructive-confirmation) checks on every file. "Only irreversible deletes ask" depends on what each mutation does, which no lint rule can see, so it lived in review and drifted.

**The undo is kept, not traded.** A confirmed delete that can be undone still offers its Restore or Undo once it lands, so the second guard is there for the wrong answer to the first.

## The revisit trigger

A delete a reader performs so often that the dialog is measurably the bottleneck of a task — and then the fix is a bulk action or a selection over the same one confirm, not a delete that stops asking.
