// Vitest 5 reports a benchmark as an ordinary test result, so there is no bench-only reporter slot: the
// Colocated-artifact reporter goes in `test.reporters` beside the default one. Naming reporters replaces the
// Default list, hence "default" first — it is what still prints the comparison table. Gated on the `bench`
// CLI verb (an exact argv element, so a `*.bench.ts` path argument cannot false-positive) so an ordinary
// `pnpm test` neither loads nor pays for it, and `undefined` leaves Vitest's own default list in place.
// Referenced as a path string rather than an import: configuration builds before shared-node.
export const getBenchmarkReporters = (): string[] | undefined =>
  process.argv.includes("bench") ? ["default", "@esposter/shared-node/reporter"] : undefined;
