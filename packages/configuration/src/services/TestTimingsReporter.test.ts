import { getModuleDuration } from "#src/services/TestTimingsReporter";
import { describe, expect, test } from "vitest";

describe(getModuleDuration, () => {
  test("adds the environment, the harness, the setup, the collect and the tests", () => {
    expect.hasAssertions();

    expect(
      getModuleDuration({
        collectDuration: 8,
        duration: 16,
        environmentSetupDuration: 1,
        prepareDuration: 2,
        setupDuration: 4,
      }),
    ).toBe(31);
  });
});
