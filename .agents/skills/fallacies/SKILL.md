---
name: fallacies
description: Apply when a session is about to propose, widen, add or "fix" something nobody asked for, when a finding argues a design is not the simplest, when a CI, cache or trigger change is being weighed, and when a review's quality lane asks whether a concern is real before asking whether the fix is. Esposter catalogue of the arguments that talk a session into work the repository does not need — the reasoning-level sibling of over-engineering.
---

# Fallacies

The one list of the arguments that lead a session to chase a change the repository does not need. `over-engineering` catalogues the **shapes** such a change takes once it is made — the wrapper, the flag, the map; this page catalogues the **reasoning** that made it look necessary, one step earlier, where the cheaper correction is to stop. Each entry lives in the skill or page named beside it, stated there in full; this is the index a review walks before it argues a finding, and nothing is stated here that another owner holds; the two rules with no other owner carry **owned here** in their heading.

## A gap in a check nothing decides on is not a defect — owned here

A missed case is a defect only where a required status or a shipped decision waits on the check; elsewhere it is a trade already made and written down (`references/undecided-checks.md`).

## A cost or a risk asserted without its measurement is a guess — owned here

A cost, speed, cache hit or risk is claimed only with the measurement that settles it, and a benefit only with the reader who would act on it (`references/unmeasured-claims.md`).

## A one-off gap in the process is fixed at its root or by hand — owned here

When an incident exposes a gap in the review or the session process, the root cause is fixed or an existing step is simplified, and the one-off is handled by hand. A new mechanism proposed for a one-off is the argument this entry names, and it is not written.

## The catalogue

| Fallacy                                                                                          | The rule and its owner                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arguing against a decision the docs, a skill, a ledger or a beside-the-line comment already made | `code-review` (`references/written-record.md`) — the written record wins, and only a contradiction between code and record reopens it                                                                                                                                              |
| An argument that merely sounds right from the diff, the security-flavoured one most of all       | `code-review` ("Refute first") — refuted or confirmed against the code and the record before it is reported; plausibility is not a fact                                                                                                                                            |
| Judging a CI change by when its slowest job ends                                                 | `openspec/specs/architecture/monorepo-tooling/design.md` — correctness first, then **total** consumption; wall-clock returns only as the no-job-becomes-the-wait constraint                                                                                                        |
| A cache keyed on what the commit changes                                                         | `openspec/specs/architecture/monorepo-tooling/design.md` — a cache whose hits land where nothing needed one; the `.nuxt` cache and its larger versions                                                                                                                             |
| Fewer steps bought with implicit behaviour                                                       | `over-engineering` ("The goal") — the implicit default makes the reader carry an equivalence two explicit steps would have spelled out                                                                                                                                             |
| A skill's size or prose volume raised as a finding                                               | `skill-authoring` ("Waiting for the size ceiling before splitting") — a to-do with one known fix, the split, run in the same change and reported as nothing                                                                                                                        |
| Excluding files, force-pushing or trimming a window to fit a review cap                          | `openspec/specs/infra/review/design.md` (step 4) — the window is cut by the review, the longest prefix of owed commits that fits `REVIEW_WINDOW_FILE_CAP`, and what overflows waits for the next run; `review-queue` — a session neither measures a window nor rewrites `ai/queue` |
| A schedule, a poll or a retry loop where a signal exists                                         | `openspec/specs/architecture/no-polling/design.md` — every wait is an awaited promise, an event or a scheduled delivery                                                                                                                                                            |
| A replacement asserted from a rename diff                                                        | `pulumi-infra` (`references/migrations.md`) — the preview's plan line is the only evidence; an applied rename reads `0 to replace`                                                                                                                                                 |

## Reading a finding against this list

- A finding or a proposal that rests on an entry here cites the owning rule and stops, never re-argues it.
- An argument that recurs without an owner is maintained the way `over-engineering` maintains a shape: the rule goes to its most specific owner first and the row here second, never the row alone.
- When the argument survives — the check is required, the measurement was taken, the record says nothing — the change is real, and `over-engineering` is the next list it is read against.

## Reference pages

- `references/undecided-checks.md` — when a proposal widens a trigger, adds a gate, a hash or a graph query for a case a check misses, or its benefit is "it would have caught X".
- `references/unmeasured-claims.md` — when a proposal or a finding asserts a cost, a speed, a cache hit, a replacement or a risk.
