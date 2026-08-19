---
title: Derived, not named
description: virrun never encodes knowledge of a specific tool — every path it treats specially is derived from structure, with git as the single sanctioned exception.
---

# Derived, not named

virrun runs **any** repo's real toolchain. So nothing in it may hardcode knowledge of a particular tool, framework, or agent: every path it treats specially must fall out of a structural property that virrun can observe, not out of a name it happens to recognise.

## The rule

> If virrun skips, masks, or special-cases a path, it must be able to say **why** in terms of the repository — not in terms of who created it.

A name is a guess about someone else's product. It goes stale when the tool renames its directory, is wrong for the next tool that does the same thing, and silently does nothing for the user who configured a different location. A structural property holds for all of them at once.

| Special case              | Derived from                                            | Not                       |
| ------------------------- | ------------------------------------------------------- | ------------------------- |
| `node_modules`            | the dependency closure a snapshot lower supplies        | a package-manager list    |
| prepare outputs (`.nuxt`) | the resolved `environment` preset's declared outputs    | a framework directory set |
| nested parallel checkouts | git's own worktree registry (`readLinkedWorktreePaths`) | an agent tool's directory |

## Git is the one exception

`.git` is named, and worktrees are read out of git's on-disk layout. That is deliberate and bounded: git is not one tool among many here, it is the substrate virrun already stands on — the [task cache](/docs/virrun/task-cache) keys off `git ls-files`/`git diff`, and a repo is the unit of work virrun exists to run. Depending on the thing that defines "a repository" is not tool coupling; depending on whatever program happened to create a directory inside one is.

The bar for adding another exception is that high: it must be a substrate every project shares, not a popular one.

## Why the rule earns its page

It was broken once, and the failure was not obvious from the diff. `.agents/worktrees` was added to the source-mirror excludes as a literal, which read as a harmless two-word constant. What it actually did:

- worked only for the exact directory one agent tool uses, at its default location
- said nothing about **why** the path was special, so the write-back never learned the same rule and kept flushing those paths back to the host
- made the exclude set look constant, when the real property (a worktree exists) changes while a repo is being worked on — the mirror was never taught to reconcile a change to it, so deleted worktrees came back from stale mirror copies

Re-deriving the same exclusion from `<commonDir>/worktrees/<name>/gitdir` fixed all three at once, and covers every tool that runs `git worktree add` — including ones that don't exist yet.

## Applying it

When you reach for a name, ask what property you actually mean:

- "skip the agent's worktrees" → _a linked worktree of this repository_ → git's registry
- "skip the build output" → _an output the environment preset declares_ → the prepare step
- "skip the editor's temp files" → _a path the walk cannot read_ → the existing unreadable-entry skip

If no structural property exists, the honest answer is usually to **not** special-case it: over-copy is correctness-safe, and [under-copy is a bug](/docs/virrun/wsl-source-mirror). A name in the source is a claim virrun cannot verify.
