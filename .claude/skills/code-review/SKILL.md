---
name: code-review
description: The single entry point for every code review — a working diff, a branch, a PR number, or an existing subsystem audited against the docs governing it. Always runs the project opus-pinned workflow script; never an inline/local review, never the review skill, never the built-in workflow by name. Apply on any review request.
---

# Code Review — One Entry Point

Every review request — `/code-review`, "review this", "review PR N", "review the docs on X and everything implementing them", post-merge audits — goes through the project workflow script. **Never review inline in the session** (reading the code yourself and reporting findings): inline reviews skip the independent verifiers, burn premium-session tokens on an execution role, and historically missed what the workflow catches. Never use the `review` skill/command — two overlapping commands is how the shallower one gets picked.

## Pick the mode first

One script, two modes. They differ only in Scope and Find; Verify → Resolve → Synthesize and the report shape are shared by construction, so a finding means the same thing whichever mode raised it.

| Ask                                                                         | Mode                                                                  | Reference       |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------- |
| Review this change / this branch / PR N / my working tree                   | `diff` (default)                                                      | `modes/diff.md` |
| Audit subsystem X — does the code match its docs, and what is broken in it? | `area`                                                                | `modes/area.md` |
| Is this proposal right, before anything is built?                           | neither — that is the `docs` skill's proposal path, not a code review | —               |

**Read the mode's page before invoking**, not after: each names what its `target` must be and how its findings differ. When the ask contains a change to review, it is `diff` — an area audit of code that a PR is currently rewriting reviews the wrong thing.

## Invocation

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "[mode] <level> [target]" });
```

- `mode` — `diff` (default, omittable) or `area`.
- `level` — `high` (default), `xhigh`, or `max`. Post-merge PR audits in this project run `high` unless asked otherwise.
- `target` — optional in `diff` mode (PR number, branch, ref range, path, or free-form instruction); **required in `area` mode**, where it names the subsystem to audit.

Both leading words are positional and optional, so `"high"`, `"diff high"`, and `"area high packages/app/app/composables/cache"` all parse. The mode is logged and lands in `stats.mode` alongside `stats.findMode`.

### A run reports the top findings per finder, never all of them

**The per-finder cap is the ceiling on what a run can report, and it is a budget — not a measurement of the code.** Each finder returns at most `perAngle` candidates and `ingest` truncates the rest; the reportable total is roughly `(finders × perAngle) + (cleanup finder × correctnessAngles × perAngle)`. The cleanup finder covers five lenses but is capped at the correctness total, because every candidate — minor or critical — buys a verifier slot, and cleanup left on a per-lens budget crowded the fan-out with findings that are minor by definition. That cap is derived from the level, not hardcoded, so retuning `correctnessAngles` keeps the invariant true.

Reported findings are deduped in code before synthesis: two candidates at the same `file:line` are the same finding by construction, so they collapse to one row carrying `[independently reported by N finders]`. The synthesizer still merges findings that share a root cause across _different_ lines — the part that needs judgement — but a synthesizer that dies can no longer ship the same bug N times. So a level does not "find everything and stop" — it finds the most salient handful per seam or lens, and the next-ranked defects surface only on a later run, after the ones above them are fixed.

This is why a large diff yields a steady tens-per-round trickle rather than one exhaustive list, and why "the last round found N, this round found N again" is not evidence the code is or isn't converging. Read it as sampling depth, not as a defect count.

A finder that hits its cap now logs `dropped N at cap` — that line is the difference between "ran dry" and "was not allowed to report more", and it is the signal to re-run at a wider level. Absent it, the level's ceiling is what you got.

Raise coverage by **raising the level** (`xhigh`/`max` widen `perAngle`, `maxSeams`, and add a sweep pass), never by re-running the same level hoping for different candidates: repeat rounds at one level re-pay the verification cost — the dominant one, since a verifier is spawned per candidate — to resample the same ranking.

- **Never `Workflow({ name: "code-review" })`** — name resolution always loads the built-in, which inherits the premium session model onto ~20 finder/verifier agents (verified 2026-07-17, ~1.46M tokens). The project script pins `model: "opus"` on every agent (execution role per the model-delegation skill).
- `args: "probe"` exits instantly with `{ probe: true }` — free parse check after editing the script. **It proves syntax only.** The probe returns before the Scope agent, so no phase has run and no ordering, TDZ, or prompt-assembly bug is caught by it; a live run is the only check for those. The script cannot be split into modules to make this easier — see the `.claude/workflows/*.js` entry in the `file-organization` skill for the probe evidence.

## The written record wins — never re-litigate a settled decision

The dominant false-positive class here is a finding that argues against a decision already made and written down: a tightened retry policy, an ingestion cap, a best-effort publish that swallows its error. Derived from the diff alone the argument always sounds right, and it comes back on every run, with a different answer each time.

`packages/app/content/docs/` (as-built docs, one page per feature/decision) and `.claude/skills/*/SKILL.md` (conventions) are the tiebreaker. A choice either tree states deliberately, with its consequence acknowledged, is settled — not a finding. It is a finding again only when the code contradicts the record, when a mitigation the record promises is missing from the code, or when the change ships behaviour the record does not cover.

The finder/verifier agents carry this rule in their scope block, so grep both trees before accepting a finding they still surface. When a decision is genuinely undocumented and keeps drawing fire, the fix is to write the page (docs skill), not to argue it again next review. The same goes for a record invalidated by materially new evidence (a security advisory, a changed dependency contract, an assumption the code has since outgrown): that reopens the decision — but the move is to update the page first and then fix the code against the new record, never to re-argue the old one inside a review thread.

## PLAUSIBLE is a to-do, never an answer

The workflow's Resolve phase settles every PLAUSIBLE finding to CONFIRMED or REFUTED before the report is written, so a run should hand you none. **If one still arrives PLAUSIBLE — a resolver died, or you are working findings from an older run — settling it is your job and does not need asking for.** Never report one, never fix one on the strength of the claim alone, and never dismiss one as "by-design" without the evidence a REFUTED verdict would have required.

A PLAUSIBLE verdict means a verifier reading one file under a budget could not reach the trigger. That is a statement about the budget, not about the code. Settling it is a different activity from verifying, and it is usually cheap:

- **Go one hop out.** Most of these die or harden at the callee or the caller — a claim about `createMessage` rejecting after a partial write is settled by reading which table `readMessages` serves, not by re-reading `createMessage`.
- **Read the dependency's real source in `node_modules`**, never its reputation — and read the whole path, not the one function named in the claim. `getRouterParams` really does decode only under `{ decode: true }`, and stopping there produced a comment asserting the route param was still percent-encoded; `h3`'s `createAppEventHandler` had already run `_decodePath` on it before routing, and the router then cut the path at the first `?` in that decoded form. One grep refuted the claim as worded and confirmed the defect it was hiding.
- **Use history.** `git log -S` / `git log -L` answers "was this guard ever here, and what removed it" directly.
- **Check the record.** A decision stated deliberately with its consequence named REFUTES the finding; a record the code contradicts CONFIRMS it.

Only a trigger that genuinely cannot be settled from the repository — a production-only config value, a cloud service's runtime behaviour — may stay unsettled, and it must name that blocker. "The investigation looked large" is not a blocker. **An unsettleable finding is still never a table row**: keep it out of the verdict table entirely and write it as the one line below the table (see Handling findings), phrased as the blocker and the fact that would settle it — "unsettleable without the deployed `MAX_UPLOAD_BYTES`; confirm that value and it decides" — so the user is asked for evidence rather than handed a verdict nobody reached.

Two things make this rule earn its cost. A PLAUSIBLE finding shipped to a human is decided by whoever has _less_ context than the agent that raised it, so it gets fixed without evidence or dropped without evidence — and a fix applied on an unconfirmed premise is the single most common way this repo introduces regressions. And a finding you dismiss without settling comes back on the next run, worded differently, forever.

## Closing a finding so the next review cannot reopen it

Applying fixes is a different activity from running the review, and it has its own checklist: **`fixing-findings.md`** in this skill directory. Read it before committing a fix, and paste it into the prompt whenever a fix round is delegated.

It exists because the dominant defect class on a re-review is not a missed bug — it is a regression introduced by the previous round's fixes. Every entry on that list describes a fix that shipped, passed its own new test, and was found again one round later, and the list is append-only: when a finding arrives with `provenance: regression` or `reopened` and no entry names why it came back, writing the new entry is part of that round.

## Handling findings

0. **Always show the user every finding the workflow reports, and keep it short.** The workflow reports every finding that survives verification — there is no cap, and duplicates are merged onto one row rather than dropped. The final message is the compact table below — one row per reported finding and nothing per-finding beyond it. The Finding column is the workflow's `shortSummary` field rendered **verbatim** (it is already the ≤60-char claim — never substitute the longer `summary`, and never re-expand it into a sentence). No failure-scenario prose, no category column. Render `severity` as a color dot: 🔴 critical, 🟡 major, 🟢 minor (default 🟡 if absent). Sort by severity. Disposition is a few words; the commit hash is stated once in a single line under the table, never per-row. Do **not** write a paragraph per finding — add at most one line below the table, and only when a disposition needs the user to decide something (e.g. a deferred fix). Workflow-refuted candidates get one footnote line naming them, nothing more. Never jump straight to fixes and report only what was changed — the visible findings list is the review deliverable.

   The Origin column is the workflow's `provenance`, with `provenanceSource` as its citation — it is what stops a review from silently re-arguing itself. `new` is first contact. `regression` means the cited line came from an earlier fix, so the fix commit is where to look for the next one. `reopened` means the record already settled this and the finding survived anyway — say what the code does that the record does not cover, or the row is a false positive. `stale-record` means the code is right and the doc is wrong, so the fix is the doc edit. Render it as the label plus its source (`regression 57dcbd3`, `stale-record docs/architecture/publishing.md`); a bare `new` needs no source.

   **In `area` mode, add a Kind column** between Where and Severity (`correctness` / `conformance` / `record-gap` / `cleanup`), because there the kind decides what the deliverable is — a code fix, a doc edit, or a new page — and the table is unreadable without it. `diff` mode omits the column: its findings are correctness or cleanup, and severity already separates them.

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
3. Run the checklist in `fixing-findings.md` over your own fixes **before** verifying — it is cheapest while the change is still in the editor. That page also owns the order of work (root-cause fix → converge the call sites → docs and skills → **then** one check pass over the finished tree, never interleaved).
4. Verify per the package-scripts skill (typecheck → tests), then commit per the git skill. Before pushing to a branch with an open PR, check CodeRabbit state (coderabbit skill).
