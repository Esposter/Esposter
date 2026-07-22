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
- `target` — optional: PR number, branch, ref range, path, or free-form instructions (`"only review src/foo.ts"`). Omit for the working diff.
- **Never `Workflow({ name: "code-review" })`** — name resolution always loads the built-in, which inherits the premium session model onto ~20 finder/verifier agents (verified 2026-07-17, ~1.46M tokens). The project script pins `model: "opus"` on every agent (execution role per the model-delegation skill).
- `args: "probe"` exits instantly with `{ probe: true }` — free parse check after editing the script.

## The written record wins — never re-litigate a settled decision

The dominant false-positive class here is a finding that argues against a decision already made and written down: a tightened retry policy, an ingestion cap, a best-effort publish that swallows its error. Derived from the diff alone the argument always sounds right, and it comes back on every run, with a different answer each time.

`packages/app/content/docs/` (as-built docs, one page per feature/decision) and `.claude/skills/*/SKILL.md` (conventions) are the tiebreaker. A choice either tree states deliberately, with its consequence acknowledged, is settled — not a finding. It is a finding again only when the code contradicts the record, when a mitigation the record promises is missing from the code, or when the change ships behaviour the record does not cover.

The finder/verifier agents carry this rule in their scope block, so grep both trees before accepting a finding they still surface. When a decision is genuinely undocumented and keeps drawing fire, the fix is to write the page (docs skill), not to argue it again next review. The same goes for a record invalidated by materially new evidence (a security advisory, a changed dependency contract, an assumption the code has since outgrown): that reopens the decision — but the move is to update the page first and then fix the code against the new record, never to re-argue the old one inside a review thread.

## Handling findings

0. **Always show the user every finding the workflow reports, and keep it short.** The workflow caps its report at `maxFindings` per level (10 at `high`, 15 at `xhigh`/`max`) and its summary discloses how many lower-ranked verified findings were omitted at the cap — surface that disclosure to the user when it appears. The final message is the compact table below — one row per reported finding and nothing per-finding beyond it. The Finding column is the workflow's `shortSummary` field rendered **verbatim** (it is already the ≤60-char claim — never substitute the longer `summary`, and never re-expand it into a sentence). No failure-scenario prose, no category column. Render `severity` as a color dot: 🔴 critical, 🟡 major, 🟢 minor (default 🟡 if absent). Sort by severity. Disposition is a few words; the commit hash is stated once in a single line under the table, never per-row. Do **not** write a paragraph per finding — add at most one line below the table, and only when a disposition needs the user to decide something (e.g. a deferred fix). Workflow-refuted candidates get one footnote line naming them, nothing more. Never jump straight to fixes and report only what was changed — the visible findings list is the review deliverable.

   **The table must actually render as a table.** Emit it flush-left at the top level of the final message — never indented, never nested inside a numbered/bulleted list item, blockquote, or code fence — with a blank line before the header row and after the last row. An indented or list-nested table is not parsed as a table by the terminal renderer and degrades into per-finding dot points, which is exactly the failure this format exists to prevent. Every row must have the same column count with `|` at both ends.

   ```markdown
   | #   | Finding                                     | Where              | Severity    | Verdict   | Disposition                          |
   | --- | ------------------------------------------- | ------------------ | ----------- | --------- | ------------------------------------ |
   | 1   | Reordered write drops entity on DB failure  | createThing.ts:40  | 🔴 critical | CONFIRMED | Fixed                                |
   | 2   | Truncated buffer decoded with wrong charset | decodeOutput.ts:15 | 🟡 major    | PLAUSIBLE | Fixed                                |
   | 3   | Publish error swallowed, not surfaced       | updateThing.ts:88  | 🟡 major    | PLAUSIBLE | By-design (architecture/standard.md) |
   | 4   | Comment names a deleted symbol              | helper.ts:6        | 🟢 minor    | CONFIRMED | Fixed                                |

   Fixes committed as abc1234. Refuted by verifiers: removeThing timeout bound ×2, batch submission ordering.
   ```

1. Verify each finding against current HEAD before fixing — post-merge findings can be stale (fixed by a later commit, file renamed), and check it against the written record above before treating it as real.
2. Fix confirmed findings; disposition PLAUSIBLE ones explicitly (fix or by-design rationale) in the report.
3. Verify per the package-scripts skill (typecheck → tests), then commit per the git skill. Before pushing to a branch with an open PR, check CodeRabbit state (coderabbit skill).
