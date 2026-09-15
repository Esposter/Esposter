---
name: fallacies
description: Apply when a session is about to propose, widen, add or "fix" something nobody asked for, when a finding argues a design is not the simplest, when a CI, cache or trigger change is being weighed, and when a review's quality lane asks whether a concern is real before asking whether the fix is. Esposter catalogue of the arguments that talk a session into work the repository does not need — the reasoning-level sibling of over-engineering — owning two rules (a gap in a check nothing decides on is not a defect; a cost or risk asserted without its measurement is a guess) and indexing the recurring fallacies each at the skill or page that holds its rule.
---

# Fallacies

The one list of the arguments that lead a session to chase a change the repository does not need. `over-engineering` catalogues the **shapes** such a change takes once it is made — the wrapper, the flag, the map; this page catalogues the **reasoning** that made it look necessary, one step earlier, where the cheaper correction is to stop. Each entry lives in the skill or page named beside it, stated there in full; this is the index a review walks before it argues a finding, and nothing is stated here that another owner holds. The rules with no other owner are marked **owned here**.

## A gap in a check nothing decides on is not a defect — owned here

A check exists to be read. Before a trigger grows a path, a gate job, a second content hash or a graph query for a case it currently misses, name what waits on its verdict: a merge blocked by a required status, a deploy that ships on green, an `up` that runs on the plan. If nothing does, the check is a courtesy — its output is a comment someone may read — and a case it misses costs nothing, because the decision was never being made there. The gate that **is** load-bearing is somewhere else, and that is the one the missed case is checked against; if it covers the case, the courtesy stays exactly as narrow as it is. The tell is a proposal whose benefit is "it would have caught X" with no sentence saying who would have acted on the catch. A missed case in a required check is a defect; the same case missed by an advisory one is a trade already made, and it is written down where the check lives so that it is not re-derived.

## A cost or a risk asserted without its measurement is a guess — owned here

"This forces a replacement", "this cache would hit", "moving the build here costs every job", "this is slow" — each is a claim with a measurement that would settle it, and the argument that sounds right from the diff is exactly the one the measurement contradicts most often. The claim is not made until the measurement is: the preview's plan line, the cache action's restore log, the list of jobs that download the artifact, the timing beside the job it is compared to. Where the measurement is expensive, the claim is stated as unmeasured and left out of the decision rather than argued from plausibility. The reverse holds too: a benefit is counted only where its reader is named, never from what a mechanism could in principle catch.

## The catalogue

| Fallacy                                                                                          | The rule and its owner                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arguing against a decision the docs, a skill, a ledger or a beside-the-line comment already made | `code-review` — the written record wins; a finding again only when the code contradicts the record or ships behaviour it does not cover                                     |
| An argument that merely sounds right from the diff, the security-flavoured one most of all       | `code-review` — refuted or confirmed against the code and the record before it is reported; plausibility is not a fact                                                      |
| Judging a CI change by when its slowest job ends                                                 | `apps/web/content/docs/architecture/monorepo-tooling.md` — correctness first, then **total** consumption; wall-clock returns only as the no-job-becomes-the-wait constraint |
| A cache keyed on what the commit changes                                                         | `apps/web/content/docs/architecture/monorepo-tooling.md` — a cache that hits only when it was not needed; the `.nuxt` cache and its two larger versions                     |
| Fewer steps bought with implicit behaviour                                                       | `over-engineering` — two explicit steps say what each does; a default that happens to select everything asks the reader to know the equivalence                             |
| A skill's size or prose volume raised as a finding                                               | `skill-authoring` — a to-do with one known fix, the split, run in the same change and reported as nothing                                                                   |
| Excluding files, force-pushing or trimming a window to fit a review cap                          | `coderabbit` — the collector holds the overflow for the next window; an exclusion hides work from the only review it gets                                                   |
| A schedule, a poll or a retry loop where a signal exists                                         | `apps/web/content/docs/architecture/no-polling.md` — every state change but a rate limit lifting is a webhook or an awaited promise                                         |
| A replacement asserted from a rename diff                                                        | `pulumi-infra` (`references/migrations.md`) — the preview's plan line is the only evidence; an applied rename reads `0 to replace`                                          |

## Reading a finding against this list

- A finding or a proposal that rests on an entry here cites the owning rule and stops, never re-argues it.
- An argument that recurs without an owner is a missing row **and** a missing rule: add the rule to the most specific skill or page, then the row here — never the rule here alone, because an index nobody loads for the file at hand is where a rule goes to be forgotten.
- When the argument survives — the check is required, the measurement was taken, the record says nothing — the change is real, and `over-engineering` is the next list it is read against.
