---
name: runtime-efficiency
description: Apply when adding a query, an index, a fan-out, a background handler, or a table nothing deletes from, when a tooling script or sweep feels slow, and when reviewing any of them. Esposter runtime efficiency — where work is placed and how it is shaped so it stays cheap: resolve a fact once at the consumer rather than at every producer, keep derivable work off the request path someone is waiting on, order an index by the lookup it has to serve rather than by the constraint it was written for, one statement per set instead of one per element, overlap independent reads and say why a sequence is load-bearing, reject cheapest-first, bound a table's growth on the write path that already holds its keys, and measure a script end to end before benching a unit — its clock is boot, spawns and reads, so the runner, one git spawn per scan and skipping generated files are where it moves.
---

# Runtime Efficiency

Where work is placed decides its cost far more than how it is written. These are the placement rules; **which `pnpm` script measures it is `package-scripts`, writing the benchmark itself is `bench`, and how the session spends its own turns is `context-efficiency`.** Query and column mechanics belong to `drizzle` and `azure-table` — this skill only decides what runs, where, and how often.

## Resolve a fact once, at the consumer

A fact several producers would each compute belongs to the single consumer that acts on it. Every producer computing it separately is the same query run N times, N chances to disagree, and N places to fix when the rule changes.

The tell is a producer asking a question whose answer it does not use — "is there anyone to notify?", "does this still exist?" — purely to decide whether to hand the work on. Hand it on unconditionally and let the consumer, which has to ask anyway, be the only one that asks.

## Keep derivable work off the request path

Anything a background handler can derive from ids it already holds does not belong in the mutation someone is waiting on. A display name, an avatar, a per-scope override, a rendered string — carry the id, resolve at the far end.

This is not the same as doing less work: the same query runs, just where nobody is blocked on it. It also collapses the copies — three producers that each resolved the same display name become one resolver.

## An index is ordered by the lookup it must serve

A composite index or unique constraint answers a prefix of its own column order and nothing else. One written for the constraint it enforces (`(endpoint, userId)` — "is this endpoint already registered") does not serve the read the system actually makes (`WHERE userId IN (…)`), and that read silently becomes a scan of the whole table.

Order the columns by the hottest lookup and let the constraint ride along, rather than adding a second index that duplicates it. Where a read is always `WHERE key = ? ORDER BY time DESC LIMIT n`, put the ordering column in the index too so a page is a range scan instead of a scan plus a sort.

## One statement per set, never one per element

A fan-out that writes a row per recipient is one `INSERT … VALUES (…), (…)`, not a loop. The same holds for the delete that trims it and the update that flips a flag across a set. A round trip per element is the cost that grows with the thing you are least in control of.

## Independent reads overlap; a sequence must justify itself

Two reads where neither feeds the other run in `Promise.all`. Two writes where the second reads what the first wrote run in sequence — and the comment says which one that is, because the next person's instinct is to parallelise it.

The dangerous case is a sequence that looks independent: rows written for one purpose that a later step reads for another. Order those explicitly and say so at the call site.

`no-await-in-loop` holds this: a loop that awaits is converted or carries the shape it keeps as its directive's reason. **Converting one, or naming why it stays sequential**, is `references/sequential-loops.md`.

## Reject cheapest-first

The check that can drop the work using nothing already in hand runs before the queries. A payload that renders to nothing, an empty id set, a flag that says this type never reaches this surface — each of those ends the call before it costs anything, and every one of them placed after a query is that query wasted on work that was never going to happen.

## A script's clock is boot, spawns and reads

A tooling script's walltime is measured end to end before any unit in it is, and the measurement is a bench —
`scripts/src/sweeps/commands.bench.ts` spawns every `ai:sweep:*` command as an agent types it, and its `*.bench.md` is
the table to read before timing anything by hand (`bench` skill, "A stopwatch is a probe, never an answer"). What it
shows: a sweep over the whole tree is one to two seconds, of which the scan itself is tens to a few hundred
milliseconds — the rest is the loader booting, a `git ls-files` per pathspec and every file read. So the savings sit
at those three:

- **The runner.** `node` boots in a fraction of `tsx`'s time; which one a script gets is the `package-scripts` skill's
  rule, decided by the syntax in its import graph and never by rewriting that syntax.
- **One spawn per scan.** `readSweepFilePaths` takes every pathspec a scan wants in one call — git walks its index
  once and lists an overlap once — where a spawn per pathspec pays the process start each time.
- **Generated files are skipped, by the list that already names them.** A scan over "every source file" reads what
  the formatter ignores as generated — snapshots and migration state were five sixths of the bytes one scan read
  — and a generated file vouches for nothing its source does not, while an old one vouches for what its source
  since dropped. `.oxfmtrc.json`'s `ignorePatterns` is the one list of them, read rather than restated. A scan
  asking what a committed file _holds_ rather than what a source vouches for reads them like anything else —
  `scripts/src/services/sweeps/controlCharacters/` is the one, and it says so where it diverges.
- **One native pass, never a hand-rolled walk.** A scan over a tree is `matchAll` or `includes` on the whole
  string — `String.prototype` and `Buffer` scan in C++, where the same loop written by hand in JavaScript costs
  several times more over the repository's bytes and reads no clearer. It is the pass that finds _nothing_ that
  has to be fast, since that is the one every clean run makes; work priced per finding (a line number, a slice)
  is free by comparison and belongs there rather than in the walk.
- **A whole-tree suite declares `TREE_READ_TIMEOUT_MS`** (`scripts/src/workspace/constants.test.ts`). Several of
  them run at once, so each one's wall time is its own read plus every sibling contending with it, and Vitest's
  5s default is what they sit just under — a new one arriving fails the others rather than itself. The timeout is
  not the budget: `pnpm bench` is.

A unit earns a bench only where its cost outgrows the corpus (`bench` skill); one that scans a file with a regex
does not, whatever the tree's size, and neither does a wrapper whose cost is a unit already benched underneath it.

## Bound growth where the keys already are

A table nothing deletes from grows forever. The trim belongs on the write path, which already holds the keys it would scope to — one indexed delete beside the insert — rather than in a sweep that has to rediscover them and gets scheduled, monitored and forgotten separately.

State the bound as a named duration or count constant, never a literal at the call site.

## Deep Dives

- `references/sequential-loops.md` — when `no-await-in-loop` reports, or a loop awaits.
