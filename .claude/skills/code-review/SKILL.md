---
name: code-review
description: The single entry point for every code review — working diff, branch, or PR number. Always runs the project opus-pinned workflow script; never an inline/local review, never the review skill, never the built-in workflow by name. Apply on any review request.
---

# Code Review — One Entry Point

Every review request — `/code-review`, "review this", "review PR N", post-merge audits — goes through the project workflow script. **Never review inline in the session** (reading the diff yourself and reporting findings): inline reviews skip the independent verifiers, burn premium-session tokens on an execution role, and historically missed what the workflow catches. Never use the `review` skill/command — two overlapping commands is how the shallower one gets picked.

## Always an Independent Second Pass Over the Whole PR

This workflow is a **separate, independent checker that runs in addition to CodeRabbit, never instead of it** — the whole point is redundant coverage so what one reviewer misses the other catches. CodeRabbit reviews incrementally (only new commits per push) and routinely misses findings; this workflow re-derives findings from scratch with its own finders + independent verifiers.

So when the ask is "review the PR" (not just "review my last change"), target the **entire PR diff** (`target` = the PR number), not only the newest commit — re-check every file in the PR, including ones CodeRabbit already saw and ones an earlier local review already passed. Scoping the second pass to just the new changes defeats the redundancy. Run it after CodeRabbit has finished (check its state per the coderabbit skill) so the two passes are both complete before the PR is considered reviewed.

## Invocation

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "<level> [target]" });
```

- `level` — `high` (default), `xhigh`, or `max`. Post-merge PR audits in this project run `high` unless asked otherwise.
- **The Find phase partitions itself by diff size** — nothing to pass. Under 50 changed files the finders split by _lens_ (one angle each over the whole diff), which is right while the territory is small enough that every finder reads every hunk. At 50 or more they split by _seam_ — one finder per subsystem, tracing it end to end plus the boundary it hands data across, since lens-splitting a release-sized diff degenerates into parallel skims that all converge on whatever is loudest. Seam mode adds a whole-diff finder so a bad seam split cannot leave territory unread. The chosen mode is logged and lands in `stats.findMode`; a run is not comparable to another without it.
- `target` — optional: PR number, branch, ref range, path, or free-form instructions (`"only review src/foo.ts"`). Omit for the working diff.
- **Never `Workflow({ name: "code-review" })`** — name resolution always loads the built-in, which inherits the premium session model onto ~20 finder/verifier agents (verified 2026-07-17, ~1.46M tokens). The project script pins `model: "opus"` on every agent (execution role per the model-delegation skill).
- `args: "probe"` exits instantly with `{ probe: true }` — free parse check after editing the script.

## The written record wins — never re-litigate a settled decision

The dominant false-positive class here is a finding that argues against a decision already made and written down: a tightened retry policy, an ingestion cap, a best-effort publish that swallows its error. Derived from the diff alone the argument always sounds right, and it comes back on every run, with a different answer each time.

`packages/app/content/docs/` (as-built docs, one page per feature/decision) and `.claude/skills/*/SKILL.md` (conventions) are the tiebreaker. A choice either tree states deliberately, with its consequence acknowledged, is settled — not a finding. It is a finding again only when the code contradicts the record, when a mitigation the record promises is missing from the code, or when the change ships behaviour the record does not cover.

The finder/verifier agents carry this rule in their scope block, so grep both trees before accepting a finding they still surface. When a decision is genuinely undocumented and keeps drawing fire, the fix is to write the page (docs skill), not to argue it again next review. The same goes for a record invalidated by materially new evidence (a security advisory, a changed dependency contract, an assumption the code has since outgrown): that reopens the decision — but the move is to update the page first and then fix the code against the new record, never to re-argue the old one inside a review thread.

## PLAUSIBLE is a to-do, never an answer

The workflow's Resolve phase settles every PLAUSIBLE finding to CONFIRMED or REFUTED before the report is written, so a run should hand you none. **If one still arrives PLAUSIBLE — a resolver died, or you are working findings from an older run — settling it is your job and does not need asking for.** Never report one, never fix one on the strength of the claim alone, and never dismiss one as "by-design" without the evidence a REFUTED verdict would have required.

A PLAUSIBLE verdict means a verifier reading one file under a budget could not reach the trigger. That is a statement about the budget, not about the code. Settling it is a different activity from verifying, and it is usually cheap:

- **Go one hop out.** Most of these die or harden at the callee or the caller — a claim about `createMessage` rejecting after a partial write is settled by reading which table `readMessages` serves, not by re-reading `createMessage`.
- **Read the dependency's real source in `node_modules`**, never its reputation. `h3` "decodes router params" was refuted in one grep of `getRouterParams`; acting on the claim would have reintroduced a traversal hole.
- **Use history.** `git log -S` / `git log -L` answers "was this guard ever here, and what removed it" directly.
- **Check the record.** A decision stated deliberately with its consequence named REFUTES the finding; a record the code contradicts CONFIRMS it.

Only a trigger that genuinely cannot be settled from the repository — a production-only config value, a cloud service's runtime behaviour — may stay unsettled, and it must name that blocker. "The investigation looked large" is not a blocker.

Two things make this rule earn its cost. A PLAUSIBLE finding shipped to a human is decided by whoever has _less_ context than the agent that raised it, so it gets fixed without evidence or dropped without evidence — and a fix applied on an unconfirmed premise is the single most common way this repo introduces regressions. And a finding you dismiss without settling comes back on the next run, worded differently, forever.

## Closing a finding so the next review cannot reopen it

A re-run over an already-fixed branch should surface only genuinely new defects. The workflow labels each finding's `provenance` for exactly this: anything other than `new` means the review has been here before, and the label names which of the six failures below it is. When it surfaces the same area again, it is almost always one of them — each with a fixed remedy.

**This list is a pre-commit checklist for whoever applies a fix, not only a diagnosis for whoever triages the next review.** Run it against your own change before committing; every entry below describes a fix that shipped, passed its own new test, and was found again one round later. Carry it into the prompt whenever a fix round is delegated (`model-delegation` skill).

- **The fix was applied to N−1 of N sites, and converge is the remedy, not N tests.** A fix that introduces a flag, a helper, an ordering, or any other invariant is not done until every existing site that could hold it does. Find them by grepping the thing the fix touched — the new parameter, the helper's name, the field being written — because the site nobody thought about is exactly the one that stays broken (a `isPublishedAssetCloned` flag threaded through the duplicate path while the restore path beside it kept the old call; a room-keyed write helper adopted by two of its three callers). **The first move is to collapse those sites onto one primitive that cannot be half-applied**, not to copy the fix and its test into each of them: the duplication is why the invariant could drift, so a per-site test only pins the drift in place and multiplies the tests a later refactor has to rewrite. Once one function owns the behaviour, one test covers it and the call sites need none — what remains to test is wiring (does this caller call it, with this room's id) and genuine business logic. Extract per the `file-organization` skill; collapse the tests per the `testing` skill's behaviour-matrix rule. Only where the sites genuinely cannot converge does each need its own fix and test.
- **The fix's claim was never pinned by a test.** A commit message that says "re-mint cached urls once the SAS expires" while the code only added an expiry check to a filter that nothing re-runs is a claim, not a behaviour. Every fix lands with a test that fails against the pre-fix code, or it is not done.
- **The fix bought its guarantee by exempting one value from an existing guard.** "Force this past the age filter / the dedupe / the retry cap" closes the finding in front of you and opens the next one, because that guard was the only thing standing between the operation and a value it must never touch — and the value a fix wants to exempt is characteristically the one another actor just wrote. So before adding an exemption, **name the guard and what it was protecting**; where that protection is real the finding is closed by deferring the work to the next pass, never by escaping the guard, and the deferral is what gets written down. An exemption that genuinely must ship lands with the test that **crosses** it — the guard's own case, plus the exempted value under exactly the condition the guard exists for. This is the single most common way a fix round introduces a worse defect than the one it closed.
- **A comment asserted a mitigation that does not exist.** "A stray entry here is swept with the rest by `cache clean`" reads to every later reviewer, and to every finder, as a closed loop — so the gap it hides survives review after review, and the comment is what stops anyone looking. A comment that names a mechanism is a claim about code: either that mechanism exists and a test pins it, or the comment states plainly that nothing reclaims it. Never assert a cleanup path you have not opened.
- **The record still describes the old behaviour.** Docs and skills are the tiebreaker a verifier grep, so a stale line is worse than no line: it argues _for_ reopening. When a fix changes behaviour the docs describe, the doc edit is part of that fix, not follow-up.
- **The decision was deliberate but written nowhere.** A dropped lint rule, an accepted cost, a revocation that must stay uncached — undocumented, these read as defects on every run. Write the decision **with its consequence named** ("nothing enforces this; an unterminated chain fails silently"), which is what stops the argument rather than inviting it.

The dominant defect class on a re-review is not a missed bug — it is a **regression introduced by the previous round's fixes**, and specifically at the seam where two independently-tested features meet (guards run before a claim × a guard that now has side effects; roll back on failure × a step that runs after the commit succeeds). Each feature's own tests stay green because each is right in isolation, and a round that adds one test per fix still leaves the seam untested — successive rounds can each land a passing test on the same few lines while the defect between them survives every one.

So the crossing test is a **requirement of any fix that edits a line an earlier fix wrote**, not an option: `git log -L <range>:<file>` on the lines you are about to change names the features to cross, and the diff of the last round's fix commits is the cheapest place to look for the next seam.

## Handling findings

0. **Always show the user every finding the workflow reports, and keep it short.** The workflow reports every finding that survives verification — there is no cap, and duplicates are merged onto one row rather than dropped. The final message is the compact table below — one row per reported finding and nothing per-finding beyond it. The Finding column is the workflow's `shortSummary` field rendered **verbatim** (it is already the ≤60-char claim — never substitute the longer `summary`, and never re-expand it into a sentence). No failure-scenario prose, no category column. Render `severity` as a color dot: 🔴 critical, 🟡 major, 🟢 minor (default 🟡 if absent). Sort by severity. Disposition is a few words; the commit hash is stated once in a single line under the table, never per-row. Do **not** write a paragraph per finding — add at most one line below the table, and only when a disposition needs the user to decide something (e.g. a deferred fix). Workflow-refuted candidates get one footnote line naming them, nothing more. Never jump straight to fixes and report only what was changed — the visible findings list is the review deliverable.

   The Origin column is the workflow's `provenance`, with `provenanceSource` as its citation — it is what stops a review from silently re-arguing itself. `new` is first contact. `regression` means the cited line came from an earlier fix, so the fix commit is where to look for the next one. `reopened` means the record already settled this and the finding survived anyway — say what the code does that the record does not cover, or the row is a false positive. `stale-record` means the code is right and the doc is wrong, so the fix is the doc edit. Render it as the label plus its source (`regression 57dcbd3`, `stale-record docs/architecture/publishing.md`); a bare `new` needs no source.

   **The table must actually render as a table.** Emit it flush-left at the top level of the final message — never indented, never nested inside a numbered/bulleted list item, blockquote, or code fence — with a blank line before the header row and after the last row. An indented or list-nested table is not parsed as a table by the terminal renderer and degrades into per-finding dot points, which is exactly the failure this format exists to prevent. Every row must have the same column count with `|` at both ends.

   ```markdown
   | #   | Finding                                     | Where              | Severity    | Verdict   | Origin                             | Disposition                          |
   | --- | ------------------------------------------- | ------------------ | ----------- | --------- | ---------------------------------- | ------------------------------------ |
   | 1   | Reordered write drops entity on DB failure  | createThing.ts:40  | 🔴 critical | CONFIRMED | regression 57dcbd3                 | Fixed                                |
   | 2   | Truncated buffer decoded with wrong charset | decodeOutput.ts:15 | 🟡 major    | CONFIRMED | new                                | Fixed                                |
   | 3   | Publish error swallowed, not surfaced       | updateThing.ts:88  | 🟡 major    | REFUTED   | reopened architecture/standard.md  | By-design (architecture/standard.md) |
   | 4   | Comment names a deleted symbol              | helper.ts:6        | 🟢 minor    | CONFIRMED | stale-record readPublishHistory.ts | Fixed                                |

   Fixes committed as abc1234. Refuted by verifiers: removeThing timeout bound ×2, batch submission ordering.
   ```

1. Verify each finding against current HEAD before fixing — post-merge findings can be stale (fixed by a later commit, file renamed), and check it against the written record above before treating it as real.
2. Fix confirmed findings. **PLAUSIBLE is not a disposition** — see below.
3. Run the closing checklist above over your own fixes **before** verifying — it is cheapest while the change is still in the editor, and every entry on it describes a fix that passed its own test and came back one round later.
4. Verify per the package-scripts skill (typecheck → tests), then commit per the git skill. Before pushing to a branch with an open PR, check CodeRabbit state (coderabbit skill).
