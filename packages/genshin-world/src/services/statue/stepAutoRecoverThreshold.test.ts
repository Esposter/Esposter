import {
  AUTO_RECOVER_THRESHOLD_DEFAULT_PERCENT,
  AUTO_RECOVER_THRESHOLD_MAXIMUM_PERCENT,
  AUTO_RECOVER_THRESHOLD_STEP_PERCENT,
} from "#src/services/statue/constants";
import { stepAutoRecoverThreshold } from "#src/services/statue/stepAutoRecoverThreshold";
import { describe, expect, test } from "vitest";

describe(stepAutoRecoverThreshold, () => {
  test("a step up or down moves the threshold by one step", () => {
    expect.hasAssertions();

    expect(stepAutoRecoverThreshold(AUTO_RECOVER_THRESHOLD_DEFAULT_PERCENT, 1)).toBe(
      AUTO_RECOVER_THRESHOLD_DEFAULT_PERCENT + AUTO_RECOVER_THRESHOLD_STEP_PERCENT,
    );
    expect(stepAutoRecoverThreshold(AUTO_RECOVER_THRESHOLD_DEFAULT_PERCENT, -1)).toBe(
      AUTO_RECOVER_THRESHOLD_DEFAULT_PERCENT - AUTO_RECOVER_THRESHOLD_STEP_PERCENT,
    );
  });

  test("a threshold is held between one step and the maximum", () => {
    expect.hasAssertions();

    expect(stepAutoRecoverThreshold(AUTO_RECOVER_THRESHOLD_MAXIMUM_PERCENT, 1)).toBe(
      AUTO_RECOVER_THRESHOLD_MAXIMUM_PERCENT,
    );
    expect(stepAutoRecoverThreshold(AUTO_RECOVER_THRESHOLD_STEP_PERCENT, -1)).toBe(AUTO_RECOVER_THRESHOLD_STEP_PERCENT);
  });
});
