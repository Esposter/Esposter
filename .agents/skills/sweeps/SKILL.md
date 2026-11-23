---
name: sweeps
description: Apply when running, resuming, ticking, adding or retiring a repo-wide sweep or its ledger, or when deciding whether a mechanical pass needs one. Esposter's repo-wide sweeps — a settled convention carried across old code one behaviour-preserving unit at a time, its progress kept as a ledger in .agents/ledgers/ and dated from commit trailers.
---

# Sweeps

A **sweep** carries one already-settled convention across a tree too large to finish in one commit. It decides nothing: the convention is owned by a skill or spec, and the sweep only applies it to code that predates it, changing no behaviour.

Each sweep is a **question**, kept as a ledger: one row in `.agents/ledgers/README.md` naming its rules owner and `Scope`, and a file for its rules and notes. Its **cells** are the units of the one area list (`.agents/ledgers/areas/`) holding a file its scope names, so every question reads the same partition and one read of a unit serves each question holding it. An entity ledger, whose unit is not a set of files (a dependency, a skill, a spec folder), keeps rows of its own (`references/ledger-files.md`). Progress is the `Ledger:` and `Reopens:` trailers on the commits that swept and reopened each cell, which `pnpm ai:sweep:status` reads.

**A ledger is named after the skill that owns its rules**, where one skill does — `pinia`, `naming`, `trpc`, `testing`. A second name for the same subject makes the ledger and the skill read as two topics, and the index row is where the pairing is stated. A ledger several skills own takes the name of the question instead (`schemas`, `styling`).

## Settled — do not re-propose

- **Copying a reading pass's findings into a ledger's rows.** A row is a unit and its state, and the findings are what the sweep's own read of that unit finds again, so a copy goes stale with every edit and carries the file and line citations the repo's prose does not hold. A finding that names a shape in several units is judged once, as built, deferred or rejected, and a single-site one is fixed where it stands or found again by the sweep of its unit.
- **Filing a sweep as an OpenSpec change.** A sweep changes no behaviour and never ends, so it is repo state in `.agents/ledgers/` rather than something that leaves when it ships (`openspec/changes/`).
- **A progress column, percentage or tick count on the index row.** A rolled-up number is a second copy of the truth that drifts; state lives at the leaf (`references/ledger-files.md`).
- **Splitting a ledger's units across parallel agents before a pilot has set the carve-outs.** A unit's carve-outs carry to the next, so one row is read first and its findings written into the brief; only then do the rows run one agent each, in parallel (`references/one-pass.md`, "Who decides the edit").
- **Storing a unit's date in a ledger file.** The trailers hold it; a stored copy is a cache of `git log` that every sitting rewrites, parallel sessions conflict over, and a skipped rewrite leaves stale (`references/ledger-files.md`).
- **A test reading the trailers.** CI checks out one commit deep, so there `git log` holds no trailer and every unit would read as open; the derived rows are held to the tree (`scripts/src/workspace/ledgerUnits.test.ts`), and the status runs locally, over full history.
- **Running a find recipe from the status, keyed by a rule id.** It needs a registry of every rule with a runnable query beside the skills that state the rules, a second copy of them. The sitting that changes a rule already holds its recipe, and one `Reopens: <ledger> | <unit>` per hit gives the same reopen (`references/standing-resume.md`).
- **Deriving the area list's units from its directories.** A unit is sized to what one pass can read, and a directory is not that size, so the list is written by hand; only an entity ledger, whose units are the tree's own entries (`LedgerUnitsMap`), derives its rows (`references/ledger-files.md`).
- **A partition per question.** One read serves every question holding the unit only while the questions share units, and a question's `Scope` already narrows what it judges inside one, so sizing units to each question buys nothing and costs the shared read.
- **Deriving a row's reopen from its pages' `Key files` dates.** A source carrying a commit newer than the page naming it reads like drift and is not: most commits to a file change nothing any page says, so the comparison flags the last tree-wide pass rather than prose gone wrong, and a ledger that is always open is read by nobody; a behaviour change declares its own reopen with the trailer (`references/ledger-files.md`).
- **Moving a ledger's scope into its owning skill's `paths:` frontmatter.** Claude Code loads a skill with `paths:` only once a matching file is touched, so it changes when every skill loads, and a scope is a question's domain, not a loading trigger: `quality` reads the whole repository, and several ledgers have more than one owner.
- **A sampled unit counted as swept.** A clean sample bounds how many defects the unread units hold; it does not read them, so a sampled unit carries no date and is owed again on a reopen or a change to its code (`references/windows-and-convergence.md`).
- **Carrying a split row's date onto the children.** The parent was split because it could never have been read, so a carried trailer dating the children records the skim as coverage. A child is a new unit, open until a pass reads it (`references/ledger-files.md`).

## The find recipe — `references/find-recipes.md`

**Prove the scan can fail before believing it passed** — run it against a known violation; an empty result is the same shape as a clean tree. Which form a scan takes is the `skill-authoring` skill's rule; a script lives under `scripts/src/sweeps/`, runs as `pnpm ai:sweep:<scan>`, and a colocated test keeps "prove the scan can fail" proved. **Writing one, or moving one out of a code block**, is `references/find-recipes.md`.

## One pass

Behaviour-preserving only (a unit correcting toward the reference or spec is named in its commit body), one unit per commit with a `Ledger: <ledger> | <unit>` trailer, a clean unit's trailer riding the next commit or a trailer-only record commit, and the checks once when the sitting goes out — the loop and every rule inside it are `references/one-pass.md`.

## The ledger file — `references/ledger-files.md`

A ledger holds only what exists nowhere else, never explanatory prose, and is keyed by the question it asks rather than by the files it reaches. **Writing, merging or retiring one**, deciding whether a mechanical pass earns a file at all or whether a new convention joins an existing question, and sizing an area unit to what one pass can read, is `references/ledger-files.md`.

## Every sweep is standing

There is no one-shot mode: a unit's trailers give it a date and the model that read it, which `pnpm ai:sweep:status` prints, a pass resumes from what changed since over the index row's `Scope`, and a row an older model read is open for a full pass (`references/standing-resume.md`).

## A sitting reads units, not ledgers — `references/windows-and-convergence.md`

A sitting reads units, not ledgers: `pnpm ai:sweep:sample` prints the units to read, each with every question it is
judged for, and a unit is never left half-read. **Planning a sitting**, sampling a question, and why a resume that
reports nothing is the sweep converging rather than failing, is `references/windows-and-convergence.md`.

A sample sitting runs the steps `references/windows-and-convergence.md` ("Sampled clean") gives, in that order.

## Draining beats scheduling

**A change that edits a file inside an unswept unit sweeps that file first**, in its own commit ahead of the behaviour change, and leaves the cell `—` (`references/draining.md`).

## When the rule runs out — `references/rule-gaps.md`

The convention a pass carries is evidence rather than authority: a unit that will not fit it is as likely to have found a gap as to be a violation. **The shapes a gap takes**, and where the fix lands, are `references/rule-gaps.md`.

## Shrinking beats re-running

**A sweep shrinks by handing what is decidable to an enforcer**, and the second time a pass writes the same finding it writes the enforcer instead; which part earns one is the decision tree in the `oxlint` skill (`references/custom-js-plugins.md`), and the handover is `references/handing-to-an-enforcer.md`.

**A sample's defects are classes, never instances.** Fixing what the sample read ends nothing: its defects are grouped by mechanical shape, each class takes the highest rung that catches every instance (the `invariants` skill's ladder: construction, lint, then a find recipe), that rung is run across the question's whole scope with every hit fixed, and the question is sampled again. The loop recurs until a sample finds no defect of a class that already holds a rung; a rung that let an instance through is moved up, and a new class starts its own pass. Quality findings are classes too: a duplicate, a near-twin helper or a slow shape is merged into one mechanism, and every copy the repository holds converges on it in the same pass, per the per-case bound in `openspec/specs/architecture/write-once/design.md`.

## Reference pages

- `references/one-pass.md` — when running a pass: the loop, the `Ledger:` trailer, a clean unit's trailer, and when the checks run.
- `references/draining.md` — when an ordinary change edits a file inside an unswept unit.
- `references/find-recipes.md` — when writing or fixing the scan a ledger points a pass at.
- `references/ledger-files.md` — when writing, merging or retiring a ledger, or sizing or splitting an area unit.
- `references/standing-resume.md` — when picking a sweep back up, or writing or widening a ledger's `Scope`.
- `references/windows-and-convergence.md` — when planning a sitting, or a finding lands in another session's file.
- `references/rule-gaps.md` — when the convention a pass carries is silent or produces something nobody would defend.
- `references/sample-reader.md` — when judging a batch as a read-only reader in a sample sitting: the unit grammar, one question at a time, refuting first, and the output line.
- `references/sample-fixer.md` — when fixing a sample sitting's units: refuting first, the three outcomes, the unread cells, and the trailers a fix carries.
- `references/handing-to-an-enforcer.md` — when a pass writes the same finding a second time.
