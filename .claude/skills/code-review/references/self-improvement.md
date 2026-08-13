# The pipeline reviews itself every round

The workflow is code in this repo, so it is reviewed by the same finders, verifiers and stop rule as everything else. Two mechanisms carry that, and neither costs an extra agent.

## 1. `.claude/` is never excluded from a review window

Pipeline edits are committed like any other change, so the **next** round's commit window contains them and the workflow reviews its own last round's edits — script, suite and this skill tree — with its own independent verifiers. That loop is the whole self-improvement mechanism, and it only works if nothing filters the path out.

So: **never put `.claude/` in a target string's exclusions and never pick a window that stops short of it.** `modes/diff.md` excludes lockfiles and already-merged upstream paths; the review workflow is the opposite case — it is the one path edited nearly every round, and it is where a mistake is silently amplified across every future review rather than confined to one feature.

Findings against it are ordinary findings: same table, same verdicts, same provenance labels, no special casing.

**Non-goal: do not push the unchanged script into every run's scope.** Per-finder caps are a ceiling and minor supply on any mature file is unbounded, so a standing scope entry would fill rows with fresh wording preferences every round, spend a finder, a verifier and possibly a resolver on each, and the all-minor stop rule would never fire. Reviewing only what changed is what converges.

## 2. The meta pass — the run's own telemetry becomes the next pipeline change

Run it once per round, after the findings table, alongside the fix round. It reads only what the run already emitted, so it spawns nothing.

| Evidence the run left behind                                                     | What it says about the pipeline                        | The change that ends it                                                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Any `stats.dropped*` non-zero, or `returned no usable candidates`                | A phase degraded and territory went unread             | Fix the cause in the script; pin it with a test in `.claude/workflows/code-review/`            |
| A finding arrived PLAUSIBLE                                                      | Resolve's budget or its prompt did not settle it       | Widen the resolver's hop or its ranking, not the report                                        |
| You settled a finding by hand and the hop was cheap                              | The verifier prompt was missing that hop               | Teach the prompt the hop; the manual settle is the spec                                        |
| The same false-positive class returns across rounds                              | Either the bar is too low or the decision is unwritten | Raise the materiality bar, or write the doc page (`docs` skill) — the record is the tiebreaker |
| A real defect escaped this run and surfaced later (CodeRabbit, next round, prod) | A lens or angle does not exist                         | Add the angle; add the regression test that fails against today's prompts                      |
| A run spent a phase on territory that produced nothing                           | The fan-out is mis-sized for that shape of diff        | Adjust the threshold or the trim, and log when it bites                                        |
| A test in the suite passes against any mutation you can imagine                  | It pins nothing and costs every run                    | Delete it — a suite that only grows stops being read                                           |

Every pipeline change lands with a test, same as any fix. A `regression` or `reopened` cause with no matching entry in `fixing-findings.md` is appended there in the same round; that list is where the compounding is stored.

## When the pipeline is converged

Whether to run another **review** round is the stop rule in `SKILL.md` and nothing here changes it. This section is narrower: it says when the **meta pass** is done for the round it belongs to. It is done once every row of the table above is either absent from the run or answered by a change — no degradation counted, nothing settled by hand, no escape — and the pipeline findings that remain are all `minor`.

**A round that changes nothing about the workflow is a valid outcome** — inventing a pipeline edit to have made one is the failure this page exists to avoid.
