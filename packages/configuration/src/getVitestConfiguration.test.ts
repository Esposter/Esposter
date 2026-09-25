import { getBenchmarkTestConfiguration } from "#src/getBenchmarkTestConfiguration";
import { getVitestConfiguration } from "#src/getVitestConfiguration";
import { afterEach, describe, expect, test } from "vitest";

describe(getVitestConfiguration, () => {
  const ORIGINAL_ARGV = process.argv;
  const testTimeout = 1;

  afterEach(() => {
    process.argv = ORIGINAL_ARGV;
  });

  test("keeps a member's own timeout outside a bench run", () => {
    expect.hasAssertions();

    process.argv = ["", "", "run"];

    expect(getVitestConfiguration("", { testTimeout }).test?.testTimeout).toBe(testTimeout);
  });

  // A member's own timeout is exactly what a bench has to outlast, so it may never win over a bench run's
  test("raises a member's own timeout on a bench run", () => {
    expect.hasAssertions();

    process.argv = ["", "", "bench"];

    expect(getVitestConfiguration("", { testTimeout }).test?.testTimeout).toBe(
      getBenchmarkTestConfiguration().testTimeout,
    );
  });
});
