---
title: Ward
description: Proposal — a collision guard; before a session edits a file another session changed in the last thirty minutes, it asks the person whether to proceed, move the work into a worktree or cancel, rather than overwriting in silence.
model: claude-opus-5-5
---

# Ward

Part of [Claude Code mods](/docs/proposals/infra/claude-mods). Several sessions working in one checkout is this repository's normal shape, and the git workflow already assumes another session's edits are in the tree. What nothing catches is two sessions editing the same file at once, where the second rewrites the first's work from a stale read. Ward asks before that happens.

## Behaviour

Every successful edit, write or notebook edit is recorded in a store the sessions on the machine share: the file's absolute path, the session that wrote it and when. Before any of those tools runs, the mod looks the path up. A record from another session within the last thirty minutes opens the engine's own question dialog, naming the file and how long ago it changed:

- **Proceed:** the edit runs.
- **Move to a worktree:** the edit is refused with a message telling the model to move this work into a git worktree and continue there.
- **Cancel:** the edit is refused with a message saying the person stopped it because another session changed the file.
- **Anything typed under Other:** the edit is refused with the person's words, which the model reads as its instruction.

A session's own records never ask, and records older than the window are pruned on each write, so the store stays as small as the last half hour of edits. A run with no one to ask, such as a headless one, proceeds, since a guard that blocks unattended work is worse than none.

## State and switching

| Store key   | Holds                                           |
| :---------- | :---------------------------------------------- |
| `edits`     | Path to the last session and time that wrote it |
| `isEnabled` | `/ward on` or `off`                             |

Whether a record calls for the question, and the pruning, are pure functions over the record and the clock, and they are what the tests cover. Whether the engine's store is read fresh across separate sessions is checked first while building. If it is not, the record moves to one file under the plugin's state directory, read and written through the engine's file noun.

## Files

All new, under `packages/genshin-mods`:

```text
src/ward/registerWard.ts             the record after an edit, the question before one
src/ward/getCollision.ts             whether a record calls for the question, and the pruning
src/ward/getCollision.test.ts
```

## Notes

- The question is the point: a guard that only blocked would stop the case where two sessions are meant to work on one file, which happens on purpose here.
- An edit made outside Claude Code, in an editor or by a script, is not recorded. Ward guards sessions from each other, and git is the record of everything else.
