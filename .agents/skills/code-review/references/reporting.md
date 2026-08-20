# Reporting Findings

Read when writing up a run's report.

The table rule itself — every finding, one compact table, flush-left — is in `SKILL.md`. This page is the shape of the table and what each column renders.

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
