// `test.runner` is the single field Vitest uses for BOTH modes — it falls back to TestRunner (test) or
// NodeBenchmarkRunner (bench) only when `runner` is unset. Our custom runner extends NodeBenchmarkRunner and
// Throws in `runTask`, so wiring it unconditionally would break `pnpm test`. Gate on the `bench` CLI verb
// (exact argv element, so a `*.bench.ts` path arg can't false-positive) and return `undefined` otherwise —
// `undefined` leaves `runner` unset, so Vitest picks its default per mode. Referenced as a path string (not
// An import) for the same reason as the reporter: configuration builds before shared-node.
export const getBenchmarkRunner = (): string | undefined =>
  process.argv.includes("bench") ? "@esposter/shared-node/runner" : undefined;
