---
title: Owner-named versions
description: A Save version command that took a labelled revision on demand — rejected because a recovery point the owner has to remember to take is not recovery, and the command read as the thing that made an edit durable.
---

# Owner-named versions

A `Save version` command sat in the blade action bar and opened a dialog with an optional label, writing a `Manual` revision the version history rendered by that label. It was removed.

## Why not

**A recovery point somebody has to ask for is not a recovery path.** It is the failure mode [no manual recovery](/docs/architecture/no-manual-recovery) rejects for async work, in the one place the person doing the remembering is the person who stands to lose the work. It fails precisely when the owner is absorbed enough in an edit not to think about losing it, which is the case the feature exists for.

**The verb collided with durability.** Every other Save in the product persists content — a TodoList item's dialog, a Sheet command, the autosave behind every editor. A command called `Save version` next to a surface that already saves reads as the thing that makes an edit real, so on a type whose every write is already durable it was a button offering something the owner already had. The gap it was filling was not a missing command; it was the missing signal that persistence had happened, which is now [save state](/docs/resource/resource-save-state).

**The automatic trigger was the actual defect.** Revisions were throttled on the save clock, so a resource under continuous editing never looked idle and left no points at all — which made a manual command feel load-bearing. Throttling on the revision clock instead gives a working session a point per interval however continuously it is edited, and there is nothing left for the command to add.

**A label is not how a row gets chosen.** History rows are picked by time, reason and a one-line summary of what they hold — `12 items`, `3 columns · 40 rows` — all of which the mechanism knows. The label was the only field that needed the owner, and it competed for slots in a ring buffer with the automatic points that did not.

## What would change our minds

An owner who genuinely needs to mark a point before a risky restructure, and says so — not inferred from the feature existing elsewhere. Even then the shape would be labelling a revision the system already took, from the history panel, rather than a command that writes one: the take stays automatic and the naming becomes metadata on a row.

The Sheet editor's in-session variant was rejected separately and for a different reason — see [named checkpoints](/docs/resource/sheet/rejected/named-checkpoints), where undo/redo already traverses prior states.
