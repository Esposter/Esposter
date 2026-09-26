---
name: context-efficiency
description: Apply when a task spans many files, when waiting on an external process from the shell, when a check fails in files the change never touched, or when deciding what to pull into the session. Esposter context and turn efficiency — what the main session reads, waits on and re-does. When and how a check runs is the running-checks skill.
---

# Context Efficiency

The main session's context is the scarce resource. These are the habits that stop it being spent on things that carry no judgment. **Which command to run and from where is the `package-scripts` skill; whether to hand execution to a subagent is `model-delegation`; when a check runs and how the session waits on it is `running-checks`.** This skill is only about what the main session reads, waits on, and re-does.

## Keep dumps out of the session

- **Answering a question that spans many files → narrow the search, never hand it to a subagent.** A targeted `Grep` with an output mode that returns the answer (`files_with_matches`, `count`, a line with its context) keeps the files out without paying a second context to re-read them; why a lookup is never delegated is `model-delegation`'s. For a single fact in a file you can already name, just read it.
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

The question is never "are there errors" but "does my change add errors" — rebuild stale packages first, and compare against the commit before the change, never HEAD (`references/pre-existing-errors.md`).

## Reference pages

- `references/pre-existing-errors.md` — when a check fails in files the change never touched, or a failure is called pre-existing.
