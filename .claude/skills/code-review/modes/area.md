# area mode — auditing a subsystem and the docs governing it

Anchored on code that already exists, with no change to review: a subsystem plus the `packages/app/content/docs/` pages and `.claude/skills/**/*.md` pages that govern it. Use it for "review the docs on X and everything implementing them", for hunting bugs in code nobody has touched recently, and before a substantial change to an area you are about to rework.

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "area <level> <target>" });
```

**`target` is required** — it is the scope. Without a change to fall back on, an area review with no target would pick a subsystem on the user's behalf and audit something nobody asked about, expensively. The script refuses rather than guessing. The target can be a path, a package, a feature, or a subsystem by its domain name (`"area high packages/app/app/composables/cache"`, `"area high the offline pagination cache"`).

## What makes it a different review, not a diff review with no diff

The record bounds the review instead of a change. Scope builds a **claim inventory**: the specific, checkable assertions the docs and skills make about how this code behaves — "reads are single-flight via `isExclusive`", "the cache evicts on room switch" — each with the page that states it. That inventory is what the review checks the code against, so a run is only as good as it: 10 sharp claims beat 40 vague ones.

Find partitions by **the same size rule as diff mode**, at a lower threshold (25 files, because area finders read whole files rather than hunks):

- **Under 25 files — lens.** Each finder gets the whole area and a different question. One dedicated **conformance finder** owns the entire claim inventory; the lens finders hunt defects and are given no claims.
- **25 files or more — seam.** One finder per subsystem, each carrying the claims about its own territory, so a single agent answers "is this correct" and "does this match what we wrote down" with the same knowledge of the subsystem. Plus a whole-area pass as the safety net. Seam mode also needs the Scope agent to have returned **at least two usable seams** — one seam is not a partition, so a thin answer falls back to lens and logs `(seam partition unusable, fell back)`.

Angle B (removed-behaviour auditor) is dropped in both — it reads the deleted side of a diff. **Angle F — invariant archaeology** replaces it, hunting guards enforced on one path and bypassed on the sibling path beside it.

Seam-splitting a small area is the failure the threshold exists to prevent: every finder gets overlapping territory and identical all-lens instructions, so they are clones that report the same lines. Small territory needs finders that differ by _question_, not by _address_ — and handing every lens finder the same claim inventory reproduces the same failure, which is why one finder owns the claims instead.

One extra pass has no counterpart in diff mode: the **coverage finder**, which looks for what neither the code nor the docs will tell you on their own — real, load-bearing, deliberate behaviour that nothing documents. That is the `fixing-findings.md` entry "the decision was deliberate but written nowhere", and an area review is the cheapest place to close it, before it has drawn fire on three separate diff reviews.

## Four finding kinds, and they are not interchangeable

| Kind          | Means                                                        | Deliverable                                             |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `correctness` | a defect in the code                                         | a code fix + a test that fails against the pre-fix code |
| `conformance` | the code and the record disagree                             | fix whichever side is wrong — the evidence says which   |
| `record-gap`  | the behaviour is deliberate but undocumented                 | a docs page, per the `docs` skill                       |
| `cleanup`     | reuse / simplification / efficiency / altitude / conventions | as in diff mode                                         |

The kinds never merge into each other (SKILL.md, dedupe). Severity for `conformance` and `record-gap` is the cost of the wrong conclusion a reader would draw, which is usually minor — a critical `record-gap` should make you suspicious that it is really a `correctness` finding wearing the wrong label.

## Scope it small, and expect it to cost

An area resolving to more than 120 files is **truncated in code**, source files first, with the drop logged. The Scope prompt asks for ~120; the cap enforces it, because an instruction is not a bound and an area review has no diff bounding it externally. A truncation log is the signal to narrow the target and run again, not to accept a thin skim.

The cap binds on the **claim inventory** too: a claim whose files were all truncated away is dropped, because a finder asked to check a documented behaviour against code the run never opened cannot find it and reports the docs as wrong. `stats.claimsChecked` against `stats.claimsInventoried` is how much of the record the run actually audited — the gap is claims nobody looked at, never claims that held.

Cost is materially higher than diff mode: finders read whole files, because in an area review every line is in scope. Measured runs on a modest subsystem at `high` land in the low millions of tokens across a few dozen agents and take tens of minutes — enough to exhaust a session limit mid-run. Budget it deliberately; do not fire it at a whole package casually, and prefer narrowing the target over raising the level.

**Session-limit resilience matters here.** When agents die, the run still returns: verifiers that fail drop their group, resolvers that fail leave findings PLAUSIBLE, and a dead synthesizer falls back to ranked-and-deduped-but-unmerged output whose summary says so. Check `stats` and the failure list before reading a degraded run as a clean one.

## Reporting

Same table as diff mode. Add one line under it naming the `record-gap` findings as a docs to-do, since those are the only rows whose fix is a page rather than a code change.
