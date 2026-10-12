---
title: Machine watcher lock
description: Proposal — two machine watchers started together cannot both pass the already-running check, so one holds the machine's sampling and heartbeat and the other exits.
model: claude-haiku-5-5
---

# Machine watcher lock

The machine watcher is started once per session, and a second watcher would sample the machine twice and push a heartbeat twice. `checkIsWatching` stops that by reading the state file, but the check and the write are not one step: two sessions starting together on a machine with no state file, or a stale one, both read it empty and both proceed. The first watcher writes the state file only after its first minute's sample, so the window stays open for a full minute.

## Scope

**Today:** `watchMachine` checks `checkIsWatching(readMachineState(), …)` once at start, then writes the state file on each reading. The state file is the only mark another watcher can see, and it is absent until the first reading that has a memory figure.

**This adds**, once the mechanism is chosen:

1. **An atomic claim** — either an exclusive lock file created with the watcher's process id, released on exit and taken over only when its process is gone, or the state file written at start, before the first sample, under a create-only write. The decision is which of the two, since the state file alone cannot be made atomic without one of them.
2. **The state file's first write** — whichever mechanism is chosen, a watcher that holds the claim is visible to a second one before its first minute's sample.

## Key files

| File                                                       | Change                                                                       |
| :--------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `scripts/src/services/machine/watchMachine.ts`             | takes the claim before its first sample, in place of the read-then-act check |
| `scripts/src/services/machine/checkIsWatching.ts`          | becomes the claim's takeover test, or is removed with the lock               |
| `apps/web/content/docs/architecture/machine-efficiency.md` | the watcher's paragraph names the claim                                      |

## Notes

- Raised by a review of the watcher's rewrite: the lock the rewrite replaced stopped two watchers outright, and the state-file check does not.
- Recorded rather than fixed because choosing between a lock file and an atomic state write is a design decision.
