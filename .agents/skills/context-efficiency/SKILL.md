---
name: context-efficiency
description: Esposter context and turn efficiency — delegate wide reads and keep the dumps out of the session, never tail a subagent's transcript, read the range not the file, fire independent tool calls in one block, poll for an external condition instead of sleeping, and diff against a clean tree before chasing errors in files you never touched. Apply when a task spans many files, when waiting on an external process from the shell, or when deciding what to pull into the session. When and how a check runs is the running-checks skill.
---

# Context Efficiency

The main session's context is the scarce resource. These are the habits that stop it being spent on things that carry no judgment. **Which command to run and from where is the `package-scripts` skill; whether to hand execution to a subagent is `model-delegation`; when a check runs and how the session waits on it is `running-checks`.** This skill is only about what the main session reads, waits on, and re-does.

## Keep dumps out of the session

- **Answering a question means sweeping many files → delegate the sweep**, take back the conclusion. A search that would pull twenty files in to answer one question should return the answer, not the files. For a single fact in a file you can already name, just read it — a subagent costs a round trip.
- **Never `Read`/`tail` a subagent's output file.** It is the full JSONL transcript; reading it overflows the context the subagent existed to protect. Wait for the completion notification.
- **Read the range, not the file**, when the symbol's location is known. Whole-file reads are for files you are about to restructure.
- **Don't re-read a file to confirm an edit.** `Edit`/`Write` fail loudly; a silent success needs no proof.
- **Fire independent tool calls in one block.** Sequential round trips cost a turn each and buy nothing when neither call feeds the other.

## Wait on a condition, never a sleep

This is about waiting on an **external process from the shell** — a dev server, a build, a deploy. It is not a loosening of the polling ban, which is about code and tests: inside the repo, a wait is an awaited signal, never a retry loop (`testing` skill, and `apps/web/content/docs/architecture/no-polling.md`). Nothing here may be copied into a test. And it is never for a check the session itself started: a backgrounded check announces its own completion, and polling it is the failure `running-checks` exists to stop.

Poll until the thing you need is actually true, with a bounded loop:

```bash
for i in $(seq 1 60); do <check> && break; sleep 2; done
```

A fixed sleep is wrong in both directions — wasted when the work finished early, a false failure when it didn't. This matters most where "done" lies: a server can answer while still building its client bundle, and async UI resolves long after the document reports complete. Poll the state you care about, not a proxy for it.

## Diff against a clean tree before chasing an error

Generated types go stale, and workspace `dist` output goes stale faster — a typecheck reporting that `@esposter/db` "has no exported member" something long-standing is a build artifact, not a regression. Rebuild the packages the errors name and re-run before reading a single one of them. The question is never "are there errors", it is **"does my change add errors"**.

**"Pre-existing" means pre-dating the change, and HEAD is not that.** On a branch where the work is committed as it goes, HEAD already contains the change under suspicion, so "it fails at HEAD too" proves only that the failure isn't from the uncommitted edit on top. Pick the commit before the one that touched the relevant file (`git log --stat -- <path>`) and check the source there with `git show <sha>:<path>` — never `git stash`, which is banned repo-wide. Getting this wrong inverts the conclusion: a real regression gets filed as unrelated and shipped.
