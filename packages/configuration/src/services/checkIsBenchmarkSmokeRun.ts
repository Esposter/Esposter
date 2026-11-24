// A bench run whose numbers nobody reads, which `pnpm bench:ci` starts by setting `BENCHMARK_SMOKE_RUN`: every bench
// Executes once through the smoke provider, and no report is written, so a local run cannot overwrite a committed
// Result with a one-sample one
export const checkIsBenchmarkSmokeRun = (): boolean => Boolean(process.env.BENCHMARK_SMOKE_RUN);
