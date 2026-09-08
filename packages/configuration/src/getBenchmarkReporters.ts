// Vitest's subcommand is the first positional argument, so it sits behind node and the CLI entry point.
const VITEST_SUBCOMMAND_INDEX = 2;
// Vitest 5 reports a benchmark as an ordinary test result, so there is no bench-only reporter slot: the
// Colocated-artifact reporter goes in `test.reporters` beside the default one. Naming reporters replaces the
// Default list, hence "default" first — it is what still prints the comparison table. Gated on the `bench` CLI
// Verb read at the subcommand position rather than anywhere in argv: `vitest run bench` and `vitest --project
// Bench` carry the same word as a filter, and matching those hands an ordinary run the reporter that rewrites
// Every `*.bench.md` it passes plus an hour-long timeout. `undefined` leaves Vitest's own default list in place.
// Referenced as a path string rather than an import: configuration builds before shared-node.
export const getBenchmarkReporters = (): string[] | undefined =>
  process.argv[VITEST_SUBCOMMAND_INDEX] === "bench" ? ["default", "@esposter/shared-node/reporter"] : undefined;
