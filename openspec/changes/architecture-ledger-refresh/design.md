# Design

## Context

A ledger is one settled question carried across a tree too large for one commit. Its index row in `.agents/ledgers/README.md` names the skill that owns the rules, the unit a pass reads and the scope that reopens a row. A unit's date and model are the `Ledger:` trailer of the commit that swept it, which `pnpm ai:sweep:status` reads from history ([the ledger redesign](../archive/2026-11-22-architecture-ledger-redesign/design.md)).

The ledgers fall into three kinds:

- **Area-split ledgers** — `invariants`, `naming`, `quality`, `security`, `test-values`, `typescript`, `file-organization`, `write-once` and `testing` — each hold one file per area of the app, packages and tooling.
- **Single-file ledgers** keyed by a framework or a tool, such as `pinia`, `trpc`, `routing`, `build`, `oxlint` and `github-actions`.
- **Derived ledgers** whose rows `LedgerUnitsMap` reads off the tree: `dependencies`, `docs/skills`, `kit-records` and `kit-differs-from-source`, and from 1.3 the openspec folders in the `quality` and `security` tooling tables.

Apart from `testing` and `write-once`, the ledgers carry dates from before the current rules, many of them from the first sitting the ledgers existed. `write-once` has no swept row at all.

## Decision

The refresh runs in two phases. The shapes come first, and every reshaped ledger then has its rows read under the current rules. A ledger whose shape stands is simply reopened and read.

```mermaid
flowchart TD
  judge[Judge each ledger's shape against write-once, the ladder and over-engineering] --> fate{Its fate}
  fate -->|stands| reopen[Reopen its rows]
  fate -->|merge, split or derive| reshape[Reshape it in one commit] --> reopen
  fate -->|an enforcer owns it now| retire[Retire the ledger and its index row]
  reopen --> batch[Read the rows in batches, one commit and trailer per unit]
  batch --> coverage[ai:sweep:status reads the trailers]
  batch -->|a fix would change behaviour| proposal[A proposal, out of the sweep]
```

Reopening a row is a `Reopens:` trailer on the commit that reopens it, and nothing else: no file holds a row's state, so the trailer is the whole record.

1.6 reopened 1,086 rows in 84 files in one commit: 557 rows under 54 whole-file trailers, and 529 rows under per-unit trailers. The cutoff is the add commit of the latest of the three pages, taken literally from `git log --diff-filter=A`, which the migration into openspec set. Following renames gives an earlier add commit instead, and then no row is reopened, since every reopened row is dated between the two. The three pages were last changed in a commit after the cutoff, and 1.6 does not reopen rows dated since. Left for the other agent: `testing`, which is not reopened, and 12 pre-cutoff rows in `genshin-evidence`, `genshin-spec-evidence`, `kit-records`, `kit-differs-from-source` and `summon-placement`.

## Shape candidates

Each candidate below is a question for its own task, not a settled answer. The pass that judges it reads the ledger's rules and its owner before deciding, and records the outcome in the owning skill or this design.

- **`genshin-evidence` and `genshin-spec-evidence`.** Both hold one row per Genshin spec page under one owner, the `openspec` skill's links-and-sources page, at nearly the same row count. If they ask one question of each page, they merge and the row is read once. If one asks it of `design.md` and the other of `spec.md`, the unit names that difference and the index row says so.
  - _Decided (1.1): merged into `genshin-evidence`, one row per spec folder._ The unit is the folder, its `design.md` and `spec.md` read together, and `LedgerUnitsMap` derives the rows from the tree, so a new folder opens at `—` with no row written by hand. The two old ledgers held 281 and 280 rows and missed six folders (`dev-tools`, `menu-time`, `menu-settings`, `kits`, `puzzles`, `session-store`), which open at `—`. Of the 286 derived folders, 280 keep the older of their two old dates, since both old rows were dated; no old row held a note. The design-side recipe drops an unchecked `- [ ]` line from test one, and test two is unchanged. Run on the carried dates, the recipe opens 38 folders: 37 are dated (3 by test one, 35 by test two) and the carry rule leaves them dated for a pass to read, and `session-store` is open. `genshin-spec-evidence` and its index row are deleted. The coverage run re-dates 82 of the carried rows to `—`: a same-day `Reopens: genshin-evidence` trailer is not older than their carried date, and the sweep trailers that dated them name design units no folder row matches. They are carried here as the carry rule states, so the next run clears them until the lead decides.
- **`kit-records` and `kit-differs-from-source`.** Both derive their rows from the same kit overlay listing. They stay apart only if a pass reading one would not also answer the other.
  - _Decided (1.2): merged into `kit-differs-from-source`, and `kit-records` is retired._ Both held one dated row per overlay (121 each), so one row now reads the overlay under the framework decisions on `Unsourced`, `Unclassified` and `DiffersFromSource`. A row keeps the older of its two dates: 62 agree, 38 keep `kit-differs-from-source`'s and 21 keep `kit-records`'s. The `design is …` notes go, since the recipe derives the design; the three content notes carry over (`columbina`, `lisa`, `tartaglia`). No overlay links to its design, and 81 of the 121 kit design pages never name their overlay, so the design folder is derived from the kit's name: `arataki-itto` is `itto`, `kuki-shinobu` is `kuki`, and the recipe's command resolves all 121 kits to exactly one folder. The `Unclassified` check moves to `kit-differs-from-source` unchanged, so it still fails only a dated row whose overlay holds one. No overlay holds `Unclassified` today; a stricter rule (no overlay may hold one at all) is a policy the lead has not chosen, and is not in this change. The coverage run raises 21 of the carried rows to a later `kit-differs-from-source` sweep trailer, a date newer than the older one the carry rule keeps; they are carried as the rule states, so the next run raises them until the lead decides.
- **The hand-listed tooling tables** in `quality`, `security` and `file-organization`, of several hundred to over a thousand rows each, one per file. A unit sized to one file is a roster the tree already holds. Either the unit becomes a directory a pass can read in one sitting, as the testing tooling rows now are, or the ledger joins `LedgerUnitsMap` and its rows are derived.
  _Decided:_ `quality/tooling` and `security/tooling` join `LedgerUnitsMap`. Their openspec rows are the tree's, one per folder holding a spec, design, tasks or proposal (1,448), and their directory units are the invariants ledger's 27, which the copies already held, so no scripts row was resized. Rows go from 695 to 1,475 in quality (844 open) and from 726 to 1,475 in security (811 open). The copies' `scripts/src — the entrypoints` row is in no invariants unit, so the derivation drops it until 1.4 adds the unit. An openspec folder an old row named keeps that row's date, and `openspec/specs/genshin/artifact-enhancement`, new to quality, takes the date of the newest commit changing its two documents. `file-organization/tooling` is resized, not derived: 1,615 rows become 320 directory units, depth four under `scripts/src` with `genshinAssets` and `genshinParity` one level deeper, 235 dated with the oldest date of the files each covers and 85 open. The 85 include units holding 893 tracked files no row covered before.
- **The area split repeated across ledgers.** Several area-split ledgers write out the same areas and units by hand. If one derived listing of areas and units could serve every area-split ledger, the copies go; if the ledgers genuinely size their units differently, each keeps its own table and the index says why. _Decided:_ one area list, which every area-split question reads and [the ledger redesign](../archive/2026-11-22-architecture-ledger-redesign/design.md) owns, with the copies and the test that held them equal rejected there.
- **A ledger an enforcer now owns.** A rule that lint or a workspace test enforces needs no pass (the `sweeps` skill, handing to an enforcer). Each ledger's rules table is read for rows the enforcement ladder has since taken over, and a ledger left with nothing to judge is retired.
  - _Decided (1.5): `summon-placement` is retired, and `claude-mods` is kept._ `summon-placement` held 13 dated rows, and its find recipe (a perl scan for an inline `afterDamage` that only places a summon) returns zero hits across the 276 card modules, so nothing is left to judge; its rule stays in the `createGcgSummonAfterDamage` bullet of `openspec/specs/genshin/genius-invokation/decks/design.md`. In the `testing` and `test-values` rules tables, the rows an enforcer owns become one-line pointers: constants inside the `describe` (`constantScope.test.ts`), exact assertions (`vitest/prefer-strict-equal`), no typed date (`test-values/no-typed-date`) and the fake clock's moments as `Temporal.Instant`s (`restrictedTestSyntaxes.js`), each checked to exist. The `testing` table has no fake-clock row, so the oxlint `testing/fake-clock-only` and `testing/no-faked-set-timeout` rules retire none of its rows, and `expect.hasAssertions()` and no polling stay, as no enforcer checked here owns them.

## One partition, one ledger per question

The resweep reads the repository once per question set, not once per ledger, so its cost is the number of units read, and what a read pays for is how many questions judge it. Before this decision every file-based ledger outside the four area-list questions kept its own partition, so a sample of thirty per ledger over 121 ledgers cost 1,017 unit reads for 1,656 judgements, 1.6 per read. Several of those partitions had no readable unit at all: `runtime-efficiency`, `build`, `routing`, `string-utils`, `comments` and `schemas` held rows of hundreds to thousands of files, which a reader can only skim or mark unread, and the first readers marked every such row unread.

- **Every file-based ledger reads the area list.** A ledger is a question: its rules owner and its `Scope`. Its cells are the area units holding a file in its scope, derived by `pnpm ai:sweep:status`, and within a unit the question judges only its in-scope files. `naming`, `typescript`, `file-organization`, `testing`, `test-values` and every single-file ledger over source files drop their own unit tables; a ledger keeps a file only for its rules and its notes, as `invariants` already does. Sizing a unit to its question was rejected: the scope already narrows a unit to the files a question reads, so a forty-file unit holding five suites is a five-file judgement for `testing`, and a partition per question is what kept one read from serving several.
- **The area is a grouping, not a ledger.** `quality/messaging` and its siblings become one `quality` ledger whose cells span every area. A trailer naming `quality/<area>` still dates the cell its unit names.
- **Entity ledgers keep their derived rows.** A ledger whose unit is not a set of files, such as a dependency, a skill, a spec folder or a kit overlay, keeps its `LedgerUnitsMap` derivation.
- **The current state carries over.** A cell is dated when every old row of the same question that covered its in-scope files was dated, with the oldest of their dates and the model that read it, through one record commit of carried `Ledger:` trailers (1.9); any other cell opens. The sample draws only from the open cells, so no swept cell is read again.
- **A sample is thirty cells per question, drawn by units.** The draw takes the rarest question first and judges each unit it reads against every question still short of thirty. Over the 742 area units, with 34 file-based questions at about eight per unit, the simulation needs about 97 unit reads for 617 judgements, against 1,017 reads for the per-ledger sample and 7,529 for a read of every open row. A full read of every file-based question is 742 unit reads.
- **A defect is answered by an enforcer before a full read.** A question whose sample finds a defect gets the find recipe or the lint rule for that defect first, as the `sweeps` skill's "Shrinking beats re-running" requires, and is sampled again; it is read unit by unit only when the defect has no mechanical shape.
- **A rule change costs a sample, not a sweep.** A skill edit reopens its own question only, by its find recipe's hits where it has one, and otherwise returns the question to sampling, so an edit costs about thirty cells, bounded by the number of questions rather than by the size of the tree.

## Rejected alternatives

- **Re-dating every row without reading it.** It would make the tables say the current rules hold where nobody has checked, which is the drift the ledgers exist to prevent.
- **Filing each ledger's refresh as its own change.** A sweep is never a change, because it never ends; one change holds only the one-time redesign and its order, and each ledger's progress stays in its own rows.
- **Reading the rows before fixing the shapes.** A pass over a ledger that is about to merge, or whose units are about to resize, is spent on a table that is then rewritten.

## Key files

| Path                                                           | Role                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| `.agents/ledgers/README.md`                                    | the index: each ledger's rules owner, unit and scope |
| `scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts` | the ledgers whose rows are derived from the tree     |
| `scripts/src/workspace/ledgerUnits.test.ts`                    | holds each derived ledger's rows to the tree         |
| `.agents/skills/sweeps/SKILL.md`                               | the sweep process, trailers and resizing rules       |
| `openspec/specs/architecture/write-once/design.md`             | the red flags a ledger's own shape is judged by      |
