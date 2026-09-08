import type { ViteUserConfig } from "vitest/config";

import { getBenchmarkReporters } from "#src/getBenchmarkReporters";
// A benchmark is an ordinary test now, so it is held to the test timeout — and a bench is the one test meant to
// Take as long as the work does: a cold build of every package is minutes, a sandboxed install longer. The
// Default would fail those on the clock and report it as a failing test rather than as a bench that ran. An hour
// Is not a budget anything is expected to reach, it is a ceiling that only a hang can hit.
const BENCHMARK_TIMEOUT_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
// The bench wiring on its own, because `defineVitestProject` (the app) builds its Vitest config from scratch
// And so can't take `getVitestConfiguration` — it spreads this instead of restating the fields, and spreads it
// **Last**, since a project's own timeout would otherwise win over the one a bench needs. Outside a bench run it
// Spreads nothing: a present `reporters: undefined` is an empty reporter list rather than an absent setting, and
// A test run that reports nothing at all still exits on the failure it never printed.
export const getBenchmarkTestConfiguration = (): NonNullable<ViteUserConfig["test"]> => {
  const reporters = getBenchmarkReporters();
  return reporters ? { hookTimeout: BENCHMARK_TIMEOUT_MS, reporters, testTimeout: BENCHMARK_TIMEOUT_MS } : {};
};
