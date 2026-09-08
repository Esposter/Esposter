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
  return reporters
    ? {
        // Vitest's module runner turns every import into a getter, and its getter tracker counts each read
        // Through a Map get plus a Map set so it can warn past a million of them. A bench over a unit that
        // Calls an imported helper once per cell pays that bookkeeping O(rows × columns) times, and it is
        // Not a rounding error: interleaved A/B runs of the 10000-row `CreateRowsCommand` bench measured
        // ~42ms per execute with the tracker installed against ~28ms without it, every off-run beating
        // Every on-run. Turning the warning off is what uninstalls it — the flag gates the tracker's
        // Construction, not just the message — so this buys the measurement back rather than hiding a
        // Result. The warning it silences is unactionable anyway: the reads it names come from inside the
        // Benched unit's own hot loop, so the only ways to answer it are aliasing a production import into
        // A module-scope local for the harness's benefit, or cutting iterations until the counter stays
        // Under the threshold — noise in shipped code, or signal thrown away, to satisfy a heuristic on an
        // Absolute count that every large-N bench here will trip. The plain getters that remain are uniform
        // Across runs, and the gate is the diff between two committed artifacts, not an absolute claim about
        // The shipped bundle (which has collapsed those imports into direct references and pays neither).
        benchmark: { suppressExportGetterWarnings: true },
        hookTimeout: BENCHMARK_TIMEOUT_MS,
        reporters,
        testTimeout: BENCHMARK_TIMEOUT_MS,
      }
    : {};
};
