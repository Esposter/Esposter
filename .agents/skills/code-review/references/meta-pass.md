# The Meta Pass

Read once per round, after the findings table: what did this round's own evidence say about the `code-review` skill's instructions? The rule itself is in `SKILL.md` — `.agents/` stays in every window and a round that changes nothing about the skill is a valid outcome; this page is the evidence table.

The meta pass is one question, asked once per round after the findings table: **what did this round's own evidence say about these instructions?**

| Evidence                                                                      | What it says                                     | The change that ends it                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| You settled a finding by hand and the hop was cheap                           | the trigger rule is missing that hop             | name the hop in "The trigger rule"                              |
| The same false-positive class returns across rounds                           | the bar is too low, or the decision is unwritten | raise the materiality bar, or write the doc page (`docs` skill) |
| A real defect escaped and surfaced later (CodeRabbit, next round, prod)       | a lens does not exist                            | add it to the lane table                                        |
| A `regression` or `reopened` finding matches no entry in `fixing-findings.md` | the cause is unrecorded and will be re-shipped   | append it there in the same round                               |

**A round that changes nothing about this skill is a valid outcome** — inventing an edit to have made one is the failure this section exists to avoid.
