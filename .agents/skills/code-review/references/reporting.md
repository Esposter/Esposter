# Reporting Findings

Read when writing up a round's report.

The table rule itself — every finding, one compact table, flush-left — is in `SKILL.md`. This page is the shape of the table and what each column renders.

| #   | Finding                                     | Where              | Lane        | Severity    | Origin                             | Disposition                       |
| --- | ------------------------------------------- | ------------------ | ----------- | ----------- | ---------------------------------- | --------------------------------- |
| 1   | Reordered write drops entity on DB failure  | createThing.ts:40  | correctness | 🔴 critical | regression 57dcbd3                 | Fixed                             |
| 2   | Truncated buffer decoded with wrong charset | decodeOutput.ts:15 | correctness | 🟡 major    | new                                | Fixed                             |
| 3   | Third copy of the branch-restore rollback   | roomInvite.ts:22   | quality     | 🟢 minor    | new                                | Fixed — extracted to `restoreRow` |
| 4   | Comment names a deleted symbol              | helper.ts:6        | correctness | 🟢 minor    | stale-record readPublishHistory.ts | Fixed                             |

Fixes committed as abc1234. Refuted while reading: removeThing timeout bound, batch submission ordering.

- **Finding** — the claim alone, ≤60 characters, no rationale or consequence clause. The trigger is what proved it; it does not go in the table. Append `×N` when the same defect was reached from N independent directions.
- **Where** — `file:line`, plus `(+N)` when the same root cause shows at other lines, named under the table.
- **Lane** — `quality` or `correctness` (SKILL.md). Omit the column when the round ran one lane only.
- **Severity** — 🔴 critical, 🟡 major (default), 🟢 minor. Sort by it, correctness above quality at equal severity. Quality findings are always minor.
- **Origin** — how the finding arose: `new` (bare, no source), `regression <sha>` (the cited line came from an earlier fix — look there next), `reopened <page>` (the record settled this; say what the code does that the record does not cover, or it is a false positive), `stale-record <path>` (the code is right and the doc is wrong, so the fix is the doc edit).
- **Disposition** — a few words. State the commit hash once under the table, never per row.
- **`area` mode adds a Kind column** after Where (`correctness` / `conformance` / `record-gap` / `cleanup`) and drops Lane, since the kind carries more.

## What goes under the table, and nothing else

At most three lines, each optional:

- **The commit hash**, once.
- **What was refuted while reading** — candidates that formed and died. One clause each, no reasoning. This is the honest signal that the refute-first pass ran; a round that reports only survivors is indistinguishable from one that never tried to break anything.
- **One unsettleable trigger**, phrased as the blocker and the fact that would settle it (SKILL.md, "Nothing unsettled ships"). Never as a row.

**No per-finding prose beyond the table.** Not a paragraph explaining each row, not the trigger written out, not the diff of the fix. The trigger exists so you can be sure; the row is what the user reads. If a finding genuinely cannot be stated in ≤60 characters, it is two findings.

## What is not in the report

No candidate counts, no coverage percentages, no token or cost estimates, no confidence numbers. A confidence figure attached to a finding you settled yourself is a number with no way to fail — it reads as precision and carries none. The disposition is the confidence: it was confirmed with a trigger, or it is not in the table.
