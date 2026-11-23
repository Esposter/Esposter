# The ledger file

Read when writing, merging or retiring a ledger in `.agents/ledgers/`, or sizing or splitting an area unit — what one file may hold, and what decides whether a new convention joins an existing question or opens its own. This page holds the whole rule; `SKILL.md` keeps the rules for running a pass.

## What a ledger holds — and nothing else

**A ledger is progress state, not a document.** Every explanatory line in one is a line the skills and docs already own, paid for twice and drifting from the moment it is written. What earns a place is only what exists nowhere else:

- **The index row** (`.agents/ledgers/README.md`) — the ledger, its rules owner, what one unit is, and the `Scope` pathspecs its domain covers. This is the sweep's whole metadata; there is no second metadata block below it, and a scope in particular never moves into the ledger file (why is `references/standing-resume.md`). What granularity a unit is dated at is not carried beside the unit either: it restates the unit in other words, and the promoted ones are the folder link.
- **Units come from the area list.** A file-based question lists no units: its cells are the bullets of `.agents/ledgers/areas/` holding a file its `Scope` names, in the grammar that folder's `README.md` states, and within a cell it judges only those files. An area file holds its bullets and nothing else.
- **Notes** — a `| Unit | Notes |` table, in the question's own file or in a `<question>/<area>.md` file holding only that question's notes for one area, with a row only for a unit something is noted on: a boundary, a carve-out or a warning the next pass needs, in the present tense. A note on a tree several units share is one bullet under the table naming the tree, rather than a copy in each unit's row.
- **No state.** The trailers are the record — `Ledger: <ledger> | <unit>` on the pass, `Reopens: <ledger>` for a whole ledger, `Reopens: <question>/<area>` for the units of one area of a question, or `<ledger> | <unit>` on the rule change that invalidates it, `Ledger: <ledger> | <unit> | <date> · <model>` to carry a pass no trailer recorded — and `pnpm ai:sweep:status` prints each unit's date and model from them, or `—`. A reworded or split unit is a new unit, open. The status also prints every trailer naming no unit, and `pnpm ai:land` refuses one in the commits it lands; a printed one is read past once its successor carries a date, never suppressed, since a list of answered trailers is a roster that drifts.
- **Entity ledgers** — a ledger whose unit is not a set of files (a catalog entry, a skill, a spec folder, a kit overlay) takes its units from the listing `LedgerUnitsMap` names, and keeps a row only for a unit it has a note or a verdict on. `scripts/src/workspace/ledgerUnits.test.ts` fails a row naming a unit the tree no longer derives, an entity ledger's against its listing and a question's against its cells.
- **Nothing a past pass did.** A Note listing the renames a pass made, or a paragraph narrating a split, a merge or a retirement, is a changelog: it describes a repo that no longer exists, it is stale the moment the next commit lands on those files, and git already holds it in full. What a pass found goes in its **commit message**; what a pass decided goes in the owning **skill**; the ledger keeps only what is true right now. A ledger that is deleted — retired to an enforcer, or absorbed into another — leaves no tombstone behind it, because its rule already lives wherever the enforcer or the surviving ledger's skill states it.
- **The find recipe** — the greps or commands specific to this convention, as bare patterns. Only where no skill states them.
- **Exclusions** — units deliberately out of scope, one clause of reason, so the next pass does not re-litigate them.
- **Next enforceable** — the part of the convention a lint rule or test could take over, and only while something is left to hand over. A part judged undecidable is a decision rather than progress, so it goes to the owning skill's `## Settled — do not re-propose` list with its one clause of why (the `skill-authoring` skill, `references/settled-lists.md`), never to a second list here that would read as pending.
- **Open findings** — only while one is genuinely open. A closed finding is deleted: its rule is in a skill, its invariant is in a test, and git holds the argument.

**A question with area notes is a folder.** Its `README.md` holds every item above but the notes, open findings
included, and each `<question>/<area>.md` holds notes and nothing else, so a finding kept on one has put it in the
one place the shape does not allow.

**"The current shape is already right" closes a finding — by documenting it, never by leaving it.** A finding that survives several passes is usually not unresolved; it is resolved and unrecorded. Someone keeps rediscovering the same duplication or asymmetry, reasoning about it, concluding the existing shape is correct, and writing that conclusion nowhere — so the ledger keeps it open and the next pass pays for the reasoning again. Three outcomes, and a finding must reach one of them:

| Verdict                            | Where it goes                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| The code is wrong                  | Fix it; delete the finding                                                                                    |
| The code is right                  | Write the **why** into the owning spec or skill (a diagram if it is an ordered mechanism); delete the finding |
| Genuinely undecided — needs a call | Stays, with the decision named and the options stated                                                         |

Deleting a "code is right" finding without recording the rationale is the same failure as deleting a docs tombstone: the reasoning dies and the finding gets re-raised. The ledger holds coverage, so the rationale never stays there — it moves to whatever owns the topic.

Anything else — what the convention says, why it matters, how a pass is run — belongs to the owning skill and is not repeated here.

**State lives in the trailers.** Neither the index row nor a ledger file restates how far a sweep has got: no tick counts, no per-area status column, no date. A stored number is a second copy of the truth that drifts, and it turns every pass into a write to a file other passes are also writing; `pnpm ai:sweep:status` counts each ledger's units by state whenever it is asked. The index row changes only
when its metadata does — a ledger added or retired, or its `Scope` rewritten (`references/standing-resume.md`).

## Does it earn a file, and what is a unit

- **Every skill that governs a tree the repo holds has a ledger, however small the tree.** A pass is cheap and getting cheaper, and a skill with no ledger is one nobody reads for — a finding against it waits for someone to trip over it. Leaving a skill unledgered until its tree is worth a sitting is rejected: its findings are raised rather than swept, and nobody reads for it. The skills with none govern a session rather than a tree (`git`, `review-queue`, `running-checks` and their kind), or are lenses the `quality` ledger's lane already reads with (the `over-engineering` skill and the `fallacies` skill, each `SKILL.md`). A mechanical pass with no owning skill is still just the change.
- **One question per file.** A convention another ledger already asks joins that ledger ("A ledger is keyed by its question, never by its address", on this page); one that asks something different opens its own, however far its files overlap.
- **A unit is what one pass can read.** Reading is what finds duplication and the helper that already exists; a unit too big to read gets grepped instead, and a grep pass that ticks its row records a sweep that never happened. When a pass reaches for grep because the unit is too large, split its bullet in the area list at the directory boundary rather than carrying on — the children open at `—` for every question, since a unit grepped because it was too large is a unit nothing read.
- **A unit holds at most `UNIT_FILE_CAP` files and `UNIT_LINE_CAP` lines.** One pass reads a unit in full — every `.ts` in full, every `.vue`'s script and template — and those two caps are what one sitting reads that way (`scripts/src/services/sweeps/ledgerCoverage/constants.ts`). Files are every non-binary file the unit's paths hold, tests included; lines count only the code a pass reads in full (the files `UNIT_CODE_FILE_REGEX` matches), so generated data, snapshots and prose add files but no lines. A unit over either limit is split at its directory boundaries until each child fits, and a sibling set that fits together shares one bullet. The precheck names every unit over either limit (`getAreaUnitSizeFindings`), so one that grows past them fails the land rather than waiting for a sitting to notice. A folder's own files have no directory boundary inside them, so when they alone are over either limit (a flat folder, or the direct files of one whose subfolders are split out) they split into name-ordered chunks: each chunk is a unit of at most `UNIT_FILE_CAP` files and `UNIT_LINE_CAP` lines, its bullet names its files exactly, and it is dated on its own pass, since one sitting reads it in full and no chunk is a partial state of its folder.
- **Split a unit the moment it reads as too high a level, before any pass starts.** Two shapes give it away without counting anything: a unit naming several unrelated trees at once, and a unit that is a whole tree rather than a directory inside one. Both are bags, and a bag is swept by skimming — which is how a fully dated ledger still misses things. Count the files the row actually covers, and split until each row is a sitting.
- **A unit that could never have been read loses its date in the split.** A child is a new unit, so it opens at `—`, and carrying the parent's date onto it with a dated trailer carries the skim forward as if it were coverage. A carried date is written only where the whole unit was small enough that the pass really could have read it. Why the split happened goes in its commit message, never into the ledger, which carries no history.
- **A migration is not a sweep.** Work gated on an external trigger (upstream shipping a feature) is tracked by its blocker table in its own design, not by coverage.

## A ledger is keyed by its question, never by its address

Two ledgers reading the same files is **not** duplication on its own. `ux` and `vue-components` both read
`app/components`, and they are two sweeps because they ask two questions of it.
They merge only when the question is the same — two ledgers reading `.agents/skills` against `skill-authoring`
are one ledger, since each pass would hand the other its findings.

The reason is attention: a pass carrying one question finds what a pass carrying twenty skims past. Passes differ by **question**, not by **address** — so widening a
ledger's rule set to cover more of a file is how a sweep quietly becomes a skim, and an area-keyed "cleanup"
ledger is that mistake at its widest. When a rule set has no ledger, the answer is a new ledger, not a wider row
on an existing one.

Its corollary bounds the count: a ledger is worth opening only for a convention **no enforcer already decides**.
A rule that oxlint or typecheck checks needs no coverage table — it fails on the line that breaks it — so the ledgers
that earn their file are the read-only-detectable ones: a helper that already exists, a name that means the wrong
thing, a guard held on one path and not its sibling.

**A new convention joins the ledger that already asks its question** — the one whose owning skill now states it — and adding it reopens that question as any rule change does (`references/standing-resume.md`, "A rule change reopens what its recipe finds"), because a cell swept against a narrower rule set is not swept against the current one and there is no partially-swept state. Sharing a file set with an existing ledger is not what decides this; the question does, as the section "A ledger is keyed by its question, never by its address" on this page sets out.
