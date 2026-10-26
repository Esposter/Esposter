# A Script's Clock

Read when a tooling script or sweep feels slow, or a whole-tree suite is added.

A tooling script's walltime is measured end to end before any unit in it is, and the measurement is a bench —
`scripts/src/workspace/sweepCommands.bench.ts` spawns every `ai:sweep:*` command as an agent types it, and its `*.bench.md` is
the table to read before timing anything by hand (the `bench` skill, `references/speed-gate.md`). What it
shows: most of a sweep over the whole tree is the loader booting, a `git ls-files` per pathspec and every file read,
and the scan itself is a small share. So the savings sit at those three:

- **The runner.** `node` boots in a fraction of `vpx`'s time; which one a script gets is
  the `package-scripts` skill's rule (`references/typescript-scripts.md`), decided by the syntax in its import graph and never by rewriting that syntax.
- **One spawn per scan.** `readSweepFilePaths` takes every pathspec a scan wants in one call — git walks its index
  once and lists an overlap once — where a spawn per pathspec pays the process start each time.
- **Generated files are skipped, by the list that already names them.** A scan over "every source file" reads what
  the formatter ignores as generated — snapshots and migration state, most of the bytes such a scan reads
  — and a generated file vouches for nothing its source does not, while an old one vouches for what its source
  since dropped. `oxfmt.config.ts`'s `ignorePatterns` is the one list of them, read rather than restated. A scan
  asking what a committed file _holds_ rather than what a source vouches for reads them like anything else —
  `scripts/src/services/sweeps/controlCharacters/` is the one, and it says so where it diverges.
- **One native pass, never a hand-rolled walk.** A scan over a tree is `matchAll` or `includes` on the whole
  string — `String.prototype` and `Buffer` scan in C++, where the same loop written by hand in JavaScript costs
  several times more over the repository's bytes and reads no clearer. It is the pass that finds _nothing_ that
  has to be fast, since that is the one every clean run makes; work priced per finding (a line number, a slice)
  is free by comparison and belongs there rather than in the walk.
- **A whole-tree suite declares `TREE_READ_TIMEOUT_MS`** (`scripts/src/workspace/constants.test.ts`), and only where the parallel `scripts/src/workspace` run exceeds Vitest's 5s default. Those suites run at once, so each one's wall time is its own read plus every sibling contending with it: a suite that passes alone can fail there, and a new one arriving fails the others rather than itself. The timeout is not the budget: `pnpm bench` is.

Which units earn a bench is the `bench` skill's rule (`references/running-benchmarks.md`), and a script whose clock is boot, spawns and reads is one of the cases it excludes.
