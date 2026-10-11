import { TYPE_BENCH_GLOB } from "#src/services/benchTypes/constants";
import { checkIsTypeBenchDrifted } from "#src/services/benchTypes/checkIsTypeBenchDrifted";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { describe, expect, test } from "vitest";

/**
 * A type bench is checked by its committed `*.typebench.md` the way a snapshot is: a count that moved from the result
 * committed beside its source is drift, and `pnpm bench:types -u` is the one way to change it (`bench` skill).
 */
describe("typeBenchResults", () => {
  const sourcePaths = readSweepFilePaths(TYPE_BENCH_GLOB);
  // Every case is one compiler process over the package, and a bench file holds several cases
  const MEASUREMENT_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");

  test(
    "every type bench matches a fresh measurement of its committed result",
    { timeout: MEASUREMENT_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      const driftedPaths = sourcePaths.filter((sourcePath) => checkIsTypeBenchDrifted(sourcePath));

      expect(driftedPaths).toStrictEqual([]);
    },
  );

  // The discovery above is the whole test's reach, so a glob matching nothing would pass vacuously.
  test("finds the type benches", () => {
    expect.hasAssertions();

    expect(sourcePaths.length).toBeGreaterThan(0);
  });
});
