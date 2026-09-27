---
title: Console worktree sessions
description: A new agent console session in its own git worktree, as the Code tab offers — deferred while this repository runs every session in one shared checkout, because a worktree here costs a full install and build.
---

# Console Worktree Sessions

**What it was.** The Code tab's **worktree** option: a new session gets "its own isolated copy using Git worktrees", so "changes in one session don't affect other sessions until you commit them" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)). The console's version would be a checkbox on the new-session form that has the host run `git worktree add` and open the session in it.

**Why deferred.** The repository the console mostly works is run in one shared checkout on purpose: a worktree per session costs a full `pnpm i` and the package builds each, plus a cleanup step, and the review queue already rejects it for exactly that ([review collector](/docs/infra/review-collector)). The sessions in that checkout commit by pathspec and never share a staged index, so the isolation a worktree buys is bought another way.

**Revisit when:** the console works a repository whose install is cheap enough for a worktree per session, or this repository's install and build become cheap enough that the review queue's rule changes. Either makes the option one form field and one host command.

**Cheaper interim:** the shared checkout with commits by pathspec, as the review queue works it.
