---
name: finishing
description: Apply when the question is what a change still owes — "are we missing anything", "is this done", "what else does this need", the `/finishing` command, or the end of any change — at any point in the work, finished or not. The completeness audit inside the finishing ritual — one row per thing a change can owe beside its code (review, a regression test, docs prose and diagrams, a skill, an open ledger row, placement and cost, an enforcer), each answered by the skill that owns it, each reported with a verdict including "nothing owed" and "not yet", and none of them restated here.
---

# Finishing — What The Change Still Owes

Working is not finished. This page answers one question: **what this change owes beside its code, and whether it has been paid.** It states no rule of its own. Every row names an owner, the owner decides, and the row reports what the owner said.

## Settled — do not re-propose

- **Gating the audit on the change being finished.** It is asked most often mid-change, as a reminder; a row the window cannot answer yet is `not yet`, and refusing the whole table over it would make the one moment it is most useful the one moment it does nothing.
- **A third lane inside `code-review`.** The review lanes settle code by reading it; most rows here have no diff to read at all — an unwritten test, an unswept ledger row, a diagram nobody updated — and folding them in would grow the one skill whose Settled list already treats size as a split trigger.
- **Restating a row's rule here.** Every row is a pointer by construction; the moment one explains its owner's rule there are two copies of it, and this is the page that goes stale first (`skill-authoring`, "One owner per topic").
- **A row for the checks.** `pnpm format`, typecheck, `lint:fix` and the tests are mechanical, batched once at the end, and owned by `running-checks` — an audit row for them would be a second place to forget them.

## When it runs

The order of the ritual, and the commit and push that close it, are `CLAUDE.md`'s "Finishing a change". This is the audit inside its first three steps.

**It runs at any point, and it is a reminder before it is a gate.** Asked mid-change it reports what is owed so far and marks the rows the window cannot answer yet as `not yet` — never a refusal to run, and never a demand that the change be finished first. Asked at the end it is the same table with every row answered. Run it unprompted at the end of a change; run it on request whenever.

**Scope the audit to the same window a review would take** (`code-review`, `references/diff-window.md`). A row is asked of that window, never of the repository.

## The audit

| The change may owe                                                     | Ask                                                                                                  | Owner                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **A review, both lanes**                                               | quality and correctness over the window                                                              | `code-review`                                   |
| **A regression test** — and the deletion of the ones it made redundant | what earns a test at all, and what no longer does                                                    | `testing`, `test-values`                        |
| **A refactor the change exposed**                                      | the twin helper, the constant restated in two files, the special case that belonged in the mechanism | `code-review` quality lane, `file-organization` |
| **Placement and cost**                                                 | where the work runs and how it is shaped, not how fast the unit is                                   | `runtime-efficiency`                            |
| **Docs prose and its diagrams**                                        | the owning page, and every diagram whose edge or box the change made false                           | `docs`                                          |
| **A skill**                                                            | a convention this change settled, or a skill claim it proved stale                                   | `skill-authoring`                               |
| **An open ledger row over the files touched**                          | whether a sweep still lists this unit unswept, which is a commit ahead of the change                 | `sweeps`                                        |
| **An enforcer instead of a repeated finding**                          | whether the same finding has now been written twice                                                  | `oxlint`                                        |

Two rows have no name to grep and are missed for it:

- **A behaviour change owes the docs sweep in reverse.** Nothing fails on a sentence that was true last week, so the lookup runs from the code: the pages whose `Key files` table names a source this change touched, read against what it now does. The rule is `CLAUDE.md` step 3; this row is only the reminder to run it.
- **A diagram is prose that cannot be grepped.** A flow diagram outlives the sentence beside it because no sweep reads its edge labels. Every diagram on a page the change touched is read, not just the paragraphs.

## Report every row, including the empty ones

A row is answered with a verdict, never with silence — **"nothing owed" is a result, and an unmentioned row reads as an unasked one.** Report the table, one line per row, then do the work the verdicts name.

The rows are independent, so an owner that finds nothing does not excuse the next: a change can be clean in both review lanes and still owe a diagram.
