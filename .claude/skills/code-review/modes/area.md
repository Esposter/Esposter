# area mode — auditing a subsystem and the docs governing it

Anchored on code that already exists, with no change to review: a subsystem plus the `packages/app/content/docs/` pages and `.claude/skills/*/SKILL.md` files that govern it. Use it for "review the docs on X and everything implementing them", for hunting bugs in code nobody has touched recently, and before a substantial change to an area you are about to rework.

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "area <level> <target>" });
```

**`target` is required** — it is the scope. Without a change to fall back on, an area review with no target would pick a subsystem on the user's behalf and audit something nobody asked about, expensively. The script refuses rather than guessing. The target can be a path, a package, a feature, or a subsystem by its domain name (`"area high packages/app/app/composables/cache"`, `"area high the offline pagination cache"`).

## What makes it a different review, not a diff review with no diff

The record bounds the review instead of a change. Scope builds a **claim inventory**: the specific, checkable assertions the docs and skills make about how this code behaves — "reads are single-flight via `isExclusive`", "the cache evicts on room switch" — each with the page that states it. That inventory is what the review checks the code against, so a run is only as good as it: 10 sharp claims beat 40 vague ones.

Find is **always seam-partitioned** (there is no small-enough case, and the lens angles read a diff that does not exist). Each seam finder carries the claims made about its own territory, so one agent answers both "is this correct" and "does this match what we wrote down" with the same knowledge of the subsystem — a separate claim-checker would re-read the same files and could not tell "the code does not do this" from "the code does this somewhere else". Angle B (removed-behaviour auditor) is dropped since it reads the deleted side of a diff; **Angle F — invariant archaeology** replaces it, hunting guards enforced on one path and bypassed on the sibling path beside it.

One extra pass has no counterpart in diff mode: the **coverage finder**, which looks for what neither the code nor the docs will tell you on their own — real, load-bearing, deliberate behaviour that nothing documents. That is the `fixing-findings.md` entry "the decision was deliberate but written nowhere", and an area review is the cheapest place to close it, before it has drawn fire on three separate diff reviews.

## Four finding kinds, and they are not interchangeable

| Kind          | Means                                                        | Deliverable                                             |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `correctness` | a defect in the code                                         | a code fix + a test that fails against the pre-fix code |
| `conformance` | the code and the record disagree                             | fix whichever side is wrong — the evidence says which   |
| `record-gap`  | the behaviour is deliberate but undocumented                 | a docs page, per the `docs` skill                       |
| `cleanup`     | reuse / simplification / efficiency / altitude / conventions | as in diff mode                                         |

A bug and the stale doc sentence describing that same bug stay **separate rows**: one is a code fix and the other is a doc edit, so merging them loses a deliverable. Severity for `conformance` and `record-gap` is the cost of the wrong conclusion a reader would draw, which is usually minor — a critical `record-gap` should make you suspicious that it is really a `correctness` finding wearing the wrong label.

## Scope it small

An area resolving to more than ~120 files is too broad for one run; Scope returns the most central ~120 and says so, which is the signal to narrow and run again rather than accept a thin skim of everything. Prefer one coherent subsystem per run — the seam partition is what buys the depth, and it degrades the same way a lens split does when the territory outgrows it.

Cost is higher per file than diff mode: finders read whole files rather than hunks, because in an area review every line is in scope.

## Reporting

Same table as diff mode. Add one line under it naming the `record-gap` findings as a docs to-do, since those are the only rows whose fix is a page rather than a code change.
