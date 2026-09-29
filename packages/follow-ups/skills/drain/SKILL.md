---
name: drain
description: Apply when asked to drain, work through or clear this repository's follow-ups, or when nothing else is asked and the repository's own instructions put its follow-ups next. Takes the open follow-ups one at a time through the follow-up tools, does each through the repository's own change loop, ticks it or hands it back, and stops when none is left or the list stops shrinking.
---

# Drain

Takes this repository's open follow-ups one at a time and does each through the repository's own change loop, until none is left. The values the tools take — the list id, the repository, the session id and the time zone — are in this session's context under "Follow-ups", passed unchanged.

## The loop

1. **Set the checkpoint.** Read `todoList_readFollowUps` and note how many are open.
2. **Read again every turn.** Call `todoList_readFollowUps` before each follow-up, never reusing an earlier answer: the owner ticks, deletes and reorders in the browser while a drain runs. None left: stop and report what was done.
3. **Check convergence.** Once as many follow-ups have been taken as the checkpoint counted, compare the open count with it. Not lower: stop and report that the list is not converging, leaving everything open for the owner. Lower: that count becomes the checkpoint.
4. **Take the first** — the list's order is the owner's, so the first is what goes first.
5. **Hand it back or do it.** Call `todoList_handBackFollowUp` with the reason when doing it would need a design decision or a choice between readings its notes leave open; anything spent outside the repository's review queue, such as opening a pull request, pushing a protected branch, a paid service or a destructive change to shared infrastructure; or more than one change. Otherwise do it exactly as the repository says any change is done — its checks, its commit, its push — and capture any new follow-up found along the way (the `capture` skill).
6. **Tick it** with `todoList_completeFollowUp` only once its commit exists, with a line naming the commit, then go back to step 2.

## Stopping

The drain stops in exactly two cases: nothing is left, or the list is not shrinking. Each pass should close more than it opens; one that captures follow-ups as fast as it closes them will not converge however long it runs, and the owner reads the list before it goes on.

It adds no approval step of its own. Its changes are the same kind a session makes when asked directly, so they rely on the repository's own safety net, such as a review queue, rather than on the drain.
