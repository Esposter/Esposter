---
name: context-efficiency
description: Esposter context and turn efficiency — delegate wide reads and keep the dumps out of the session, never tail a subagent's transcript, batch verification into one pass at the end, poll for a condition instead of sleeping, and diff against a clean tree before chasing errors in files you never touched. Apply when a task spans many files, when choosing how to wait on something, or when deciding what to pull into the session.
---

# Context Efficiency

The main session's context is the scarce resource. These are the habits that stop it being spent on things that carry no judgment. **Which command to run and from where is the `package-scripts` skill; whether to hand execution to a subagent is `model-delegation`.** This skill is only about what the main session reads, waits on, and re-does.

## Keep dumps out of the session

- **Answering a question means sweeping many files → delegate the sweep**, take back the conclusion. A search that would pull twenty files in to answer one question should return the answer, not the files. For a single fact in a file you can already name, just read it — a subagent costs a round trip.
- **Never `Read`/`tail` a subagent's output file.** It is the full JSONL transcript; reading it overflows the context the subagent existed to protect. Wait for the completion notification.
- **Read the range, not the file**, when the symbol's location is known. Whole-file reads are for files you are about to restructure.
- **Don't re-read a file to confirm an edit.** `Edit`/`Write` fail loudly; a silent success needs no proof.
- **Fire independent tool calls in one block.** Sequential round trips cost a turn each and buy nothing when neither call feeds the other.

## One verification pass, not one per chunk

Batch format/typecheck/tests until **all** edits are done. Each pass re-pays a fixed startup cost, so per-chunk checking multiplies it for no extra signal — nothing is learned at chunk 3 that chunk 7 won't also reveal.

Commit per coherent chunk regardless: commits are cheap and protect against other sessions' resets, checks are not.

The pass runs **after** `/simplify`, not before — cleanup edits code, so checking first pays the startup cost twice. See "Finishing a change" in `CLAUDE.md` for the full order.

## Wait on a condition, never a sleep

This is about waiting on an **external process from the shell** — a dev server, a build, a deploy. It is not a loosening of the polling ban, which is about code and tests: inside the repo, a wait is an awaited signal, never a retry loop (`testing` skill, and `packages/app/content/docs/architecture/no-polling.md`). Nothing here may be copied into a test.

Poll until the thing you need is actually true, with a bounded loop:

```bash
for i in $(seq 1 60); do <check> && break; sleep 2; done
```

A fixed sleep is wrong in both directions — wasted when the work finished early, a false failure when it didn't. This matters most where "done" lies: a server can answer while still building its client bundle, and async UI resolves long after the document reports complete. Poll the state you care about, not a proxy for it.

## Diff against a clean tree before chasing an error

Generated types go stale, and workspace `dist` output goes stale faster — a typecheck reporting that `@esposter/db` "has no exported member" something long-standing is a build artifact, not a regression. Rebuild the packages the errors name and re-run before reading a single one of them. The question is never "are there errors", it is **"does my change add errors"**.

**"Pre-existing" means pre-dating the change, and HEAD is not that.** On a branch where the work is committed as it goes, HEAD already contains the change under suspicion, so "it fails at HEAD too" proves only that the failure isn't from the uncommitted edit on top. Pick the commit before the one that touched the relevant file (`git log --stat -- <path>`) and check the source there with `git show <sha>:<path>` — never `git stash`, which is banned repo-wide. Getting this wrong inverts the conclusion: a real regression gets filed as unrelated and shipped.
