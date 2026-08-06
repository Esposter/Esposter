---
name: code-review
description: The single entry point for every code review — a working diff, a branch, a PR number, or an existing subsystem audited against the docs governing it. Always runs the project opus-pinned workflow script; never an inline/local review, never the review skill, never the built-in workflow by name. Also owns how to size the commit window a review is launched from, what a run costs and what bounds it, the confidence numbers on its verdicts, how to close a finding so the next review cannot reopen it, and the stop rule for when to re-run and when a round is converged. Apply on any review request, when choosing the scope or boundary to review, when deciding whether to run another round, and when applying fixes from one.
---

# Code Review — One Entry Point

Every review request — `/code-review`, "review this", "review PR N", post-merge audits — goes through the project workflow script. **Never review inline in the session** (reading the code yourself and reporting findings): inline reviews skip the independent verifiers, spend premium-session tokens on an execution role, and historically missed what the workflow catches. Never use the `review` skill/command — two overlapping commands is how the shallower one gets picked.

## Pick the mode first

One script, two modes, differing only in Scope and Find; Verify → Resolve → Synthesize and the report shape are shared, so a finding means the same thing whichever mode raised it.

| Ask                                                                         | Mode                                                                  | Reference       |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------- |
| Review this change / this branch / PR N / my working tree                   | `diff` (default)                                                      | `modes/diff.md` |
| Audit subsystem X — does the code match its docs, and what is broken in it? | `area`                                                                | `modes/area.md` |
| Is this proposal right, before anything is built?                           | neither — that is the `docs` skill's proposal path, not a code review | —               |

**Read the mode's page before invoking**, not after: each names what its `target` must be and how its findings differ. When the ask contains a change to review, it is `diff` — an area audit of code a PR is rewriting reviews the wrong thing.

## Invocation

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "[mode] <level> [target]" });
```

- `mode` — `diff` (default, omittable) or `area`.
- `level` — `high` (default), `xhigh`, or `max`. Post-merge PR audits run `high` unless asked otherwise.
- `target` — optional in `diff` (PR number, branch, ref range, path, free-form instruction); **required in `area`**, where it names the subsystem. Omitting it takes the working diff, which is usually the wrong scope — `modes/diff.md` owns picking the commit window.

Both leading words are positional and optional (`"high"`, `"diff high"`, `"area high packages/app/…"` all parse). **A leading mode word only switches modes when a level word follows it** — otherwise it is part of the target, because diff targets are free-form English. So always spell the level out when you mean the mode.

- **Never `Workflow({ name: "code-review" })`** — name resolution loads the built-in, which inherits the premium session model onto ~20 agents (~1.46M tokens). The project script pins `model: "opus"` on every agent.
- `args: "probe"` exits instantly with `{ probe: true }` — a free **syntax** check after editing the script. It returns before the Scope agent, so no ordering, TDZ or prompt-assembly bug is caught by it; only a live run checks those.

## Coverage, cost and when to re-run — `references/run-economics.md`

Read it when choosing a level, reading a run's `stats`, or deciding on another round. In short: a run reports the top findings **per finder**, so its ceiling (`stats.reportableCeiling`) is a budget, not a defect count; widen by raising the level, never by re-running the same one; every discard is counted in a `stats.dropped*` field, and a degraded run is not a clean file.

**The stop rule: a round whose CONFIRMED findings are all `minor` is converged.** Fix them if cheap, then stop. Another round needs a CONFIRMED `critical`/`major`, a `dropped N at cap` line, or a fix round that touched lines an earlier fix wrote.

## The written record wins — never re-litigate a settled decision

The dominant false-positive class is a finding arguing against a decision already made and written down: a tightened retry policy, an ingestion cap, a best-effort publish that swallows its error. From the diff alone the argument always sounds right, and it returns every run with a different answer.

`packages/app/content/docs/` and `.claude/skills/**/*.md` are the tiebreaker — the whole skill tree, not the index pages alone: a binding rule as often sits in a skill's `references/*.md` deep dive as in its `SKILL.md`. A choice either tree states deliberately, with its consequence acknowledged, is settled — not a finding. It is a finding again only when the code contradicts the record, when a mitigation the record promises is missing, or when the change ships behaviour the record does not cover.

Finder and verifier agents carry this rule, so grep both trees before accepting one they still surface. A genuinely undocumented decision that keeps drawing fire is closed by writing the page (`docs` skill), not by arguing it again. A record invalidated by materially new evidence (an advisory, a changed dependency contract) reopens the decision — update the page first, then fix the code against the new record.

## PLAUSIBLE is a to-do, never an answer

Resolve settles every finding before the report, so a run should hand you none. **If one arrives PLAUSIBLE — a resolver died, or the findings are from an older run — settling it is your job and needs no asking.** Never report one, never fix one on the claim alone, never dismiss one as by-design without the evidence a REFUTED verdict would need.

PLAUSIBLE means a verifier reading one file under a budget could not reach the trigger — a statement about the budget, not the code. Settling is usually cheap: go one hop out to the caller or callee; read the dependency's real source in `node_modules` along the whole path, never its reputation; use `git log -S` / `git log -L` for "was this guard ever here"; check the record.

Only a trigger that genuinely cannot be settled from the repository (a production-only config value, a cloud service's runtime behaviour) may stay unsettled, and it must name that blocker — "the investigation looked large" is not one. **An unsettleable finding is never a table row**: write it as the one line below the table, phrased as the blocker and the fact that would settle it, so the user is asked for evidence rather than handed a verdict nobody reached.

Two things make this worth its cost: a PLAUSIBLE finding shipped to a human is decided by whoever has _less_ context than the agent that raised it, and a fix on an unconfirmed premise is the most common way this repo introduces regressions; and a finding dismissed without evidence comes back next run, worded differently, forever.

## Reporting findings

**Show the user every finding the workflow reports, as one compact table and nothing per-finding beyond it.** Final assembly adds no cap of its own. Never jump to fixes and report only what changed — the visible findings list is the deliverable.

Emit the table **flush-left at the top level** of the message — never indented or nested in a list, blockquote or code fence, blank line before and after, same column count in every row. An indented table degrades into dot points, which is the failure this format exists to prevent.

| #   | Finding                                     | Where              | Severity    | Verdict       | Origin                             | Disposition                          |
| --- | ------------------------------------------- | ------------------ | ----------- | ------------- | ---------------------------------- | ------------------------------------ |
| 1   | Reordered write drops entity on DB failure  | createThing.ts:40  | 🔴 critical | CONFIRMED 95% | regression 57dcbd3                 | Fixed                                |
| 2   | Truncated buffer decoded with wrong charset | decodeOutput.ts:15 | 🟡 major    | CONFIRMED 80% | new                                | Fixed                                |
| 3   | Publish error swallowed, not surfaced       | updateThing.ts:88  | 🟡 major    | REFUTED 90%   | reopened architecture/standard.md  | By-design (architecture/standard.md) |
| 4   | Comment names a deleted symbol              | helper.ts:6        | 🟢 minor    | CONFIRMED 75% | stale-record readPublishHistory.ts | Fixed                                |

Fixes committed as abc1234. Refuted by verifiers: removeThing timeout bound ×2, batch submission ordering.

- **Finding** — the workflow's `shortSummary` **verbatim** (already the ≤60-char claim; never substitute `summary`, never re-expand it). Append `×N` when `corroboration > 1`.
- **Where** — `file:line`, plus `(+N)` when `alsoAt` is non-empty.
- **Severity** — 🔴 critical, 🟡 major (default), 🟢 minor. Sort by it.
- **Verdict** — verdict plus the workflow's `confidence`. Never restate it in prose, never round up.
- **Origin** — `provenance` + `provenanceSource`: `new` (bare, no source), `regression <sha>` (the cited line came from an earlier fix — look there next), `reopened <page>` (the record settled this; say what the code does that the record does not cover, or it is a false positive), `stale-record <path>` (the code is right and the doc is wrong, so the fix is the doc edit).
- **Disposition** — a few words. State the commit hash once under the table, never per row.
- Add at most one line below the table, and only when a disposition needs the user to decide something. Workflow-refuted candidates get one footnote line.
- **`area` mode adds a Kind column** after Where (`correctness` / `conformance` / `record-gap` / `cleanup`) — there the kind decides whether the deliverable is a code fix, a doc edit or a new page. `diff` omits it; severity already separates its two kinds.

**A merged row's columns describe the group, not the printed claim**: verdict escalates to CONFIRMED if any member is, severity takes the worst member, confidence the highest among members agreeing with the escalated verdict. So a `🔴 critical | CONFIRMED 95%` row can print a milder member's text, with the confirming evidence in a member the report does not show — `corroboration` and `alsoAt` are the only visible signal, which is why both are rendered.

## Then: fix, verify, commit

1. Verify each finding against current HEAD before fixing — post-merge findings can be stale — and check it against the written record above.
2. Fix confirmed findings. **PLAUSIBLE is not a disposition.**
3. Run **`fixing-findings.md`** over your own fixes before verifying — it owns the regression checklist and the order of work (root cause → converge the call sites → docs and skills → then one check pass), and it is the block to paste into a delegated fix round.
4. Verify per the `package-scripts` skill (typecheck → tests), commit per the `git` skill. Before pushing to a branch with an open PR, check CodeRabbit state (`coderabbit` skill).
