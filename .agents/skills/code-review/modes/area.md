# area mode — auditing a subsystem and the docs governing it

Anchored on code that already exists, with no change to review: a subsystem plus the `packages/app/content/docs/` pages and `.agents/skills/**/*.md` pages that govern it. Use it for "review the docs on X and everything implementing them", for hunting bugs in code nobody has touched recently, and before a substantial change to an area you are about to rework.

**A target is required** — it is the scope. Without a change to fall back on, an area review with no target audits something nobody asked about, expensively. Ask which subsystem rather than guessing. The target can be a path, a package, a feature, or a subsystem by its domain name.

## What makes it a different review, not a diff review with no diff

The record bounds the review instead of a change. Before reading the code, build a **claim inventory**: the specific, checkable assertions the docs and skills make about how this code behaves — "<read path> is single-flight via <named flag>", "<cache> evicts on <event>" — each with the page that states it. That inventory is what the code is then checked against, so a round is only as good as it: **10 sharp claims beat 40 vague ones**, and a claim you cannot imagine the code failing is not a claim.

Two lenses have no counterpart in diff mode, because a diff supplies them for free:

- **Invariant archaeology** — a guard enforced on one path and bypassed on the sibling path beside it. A diff review sees both sides of a change; here nothing points at the pair, so go looking for it.
- **The coverage question** — real, load-bearing, deliberate behaviour that nothing documents. That is `fixing-findings.md`'s "the decision was deliberate but written nowhere", and an area review is the cheapest place to close it, before it has drawn fire on three separate diff reviews.

## Four finding kinds, and they are not interchangeable

| Kind          | Means                                           | Deliverable                                             |
| ------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `correctness` | a defect in the code                            | a code fix + a test that fails against the pre-fix code |
| `conformance` | the code and the record disagree                | fix whichever side is wrong — the evidence says which   |
| `record-gap`  | the behaviour is deliberate but undocumented    | a docs page, per the `docs` skill                       |
| `cleanup`     | a CLAUDE.md or skill convention the code breaks | as in diff mode                                         |

Severity for `conformance` and `record-gap` is the cost of the wrong conclusion a reader would draw, which is usually minor — a critical `record-gap` should make you suspicious that it is really a `correctness` finding wearing the wrong label.

The trigger rule (SKILL.md) applies to `correctness` and to `conformance` alike: a `conformance` finding's trigger is the line of the page and the line of the code that contradict it, quoted. Without both quoted it is a recollection of what the docs say, and those are wrong about as often as the code is.

## Scope it small — the cap is what one context can read

Every line of every file is in scope here, not hunks, so an area costs several times what the same file count costs in diff mode. **Narrow the target rather than deepening the read**: a subsystem whose files you can open in full, hold together, and check the claim inventory against is the right size, and one that would have to be skimmed is two rounds.

When the target is narrowed, say what was left out and mark the claims whose files went with it — **a claim whose code the round never opened is unaudited, never a claim that held.** A finder asked to check a documented behaviour against code it never read reports the docs as wrong every time.

## The one escape hatch — cold readers for a subsystem nothing has read

This is the single place a subagent still earns its keep, and it is deliberately narrow.

**When the target is large and cold** — a subsystem this session has never opened, where loading it in full would crowd out the reading itself — spawn a small handful of **readers**, never finders. Each takes one sub-path and returns a structured map: what each file does, the public surface, the invariants it appears to enforce, and the lines that look load-bearing. Then find, refute and report **in-thread** against those maps, opening the specific files the candidates depend on.

The distinction is the whole point:

- A **reader** answers "what is here" — cheap, mechanical, and its context is disposable because its output is the deliverable.
- A **finder** answers "what is wrong" — and its judgement dies with it, leaving a claim nobody in the session can settle without re-reading everything anyway.

Rules for the hatch: readers only; one per sub-path; no verifier, resolver or synthesizer stage; and the candidates are still yours to construct and refute under SKILL.md's two rules. A reader that returns findings has been mis-prompted — its map is what you asked for.

Everything else — a target the session has already read, a diff of any size, a subsystem small enough to open — runs entirely in-thread.

## Reporting

Same table as diff mode (`../references/reporting.md`), plus a **Kind** column after Where, since here the kind decides whether the deliverable is a code fix, a doc edit or a new page. Add one line under the table naming the `record-gap` findings as a docs to-do.
