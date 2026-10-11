import { MIN_HISTORY, SLOW_RUN_FACTOR } from "#src/services/timing/constants";
import { getSlowRunWarning } from "#src/services/timing/getSlowRunWarning";
import { describe, expect, test } from "vitest";

describe(getSlowRunWarning, () => {
  const COMMAND = "ai:sweep:duplicate-code";
  const USUAL_MILLISECONDS = 1000;
  const SLOW_MILLISECONDS = 2500;
  const history = Array.from({ length: MIN_HISTORY }, () => USUAL_MILLISECONDS);

  test("names the run's seconds, its multiple of the usual, and the usual", () => {
    expect.hasAssertions();

    expect(getSlowRunWarning(COMMAND, SLOW_MILLISECONDS, history)).toBe(
      "ai:sweep:duplicate-code took 2.5s, 2.5× its usual 1.0s",
    );
  });

  test("is silent for a run at or within the factor of the median", () => {
    expect.hasAssertions();

    expect(getSlowRunWarning(COMMAND, USUAL_MILLISECONDS * SLOW_RUN_FACTOR, history)).toBeUndefined();
  });

  test("is silent until the history holds MIN_HISTORY runs", () => {
    expect.hasAssertions();

    const shortHistory = Array.from({ length: MIN_HISTORY - 1 }, () => USUAL_MILLISECONDS);

    expect(getSlowRunWarning(COMMAND, SLOW_MILLISECONDS, shortHistory)).toBeUndefined();
    expect(getSlowRunWarning(COMMAND, SLOW_MILLISECONDS, [])).toBeUndefined();
  });
});
