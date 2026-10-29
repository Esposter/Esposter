import { VERIFY_TOLERANCE_PERCENT } from "#src/services/genshinParity/reference/constants";
import { isWithinVerifyTolerance } from "#src/services/genshinParity/reference/isWithinVerifyTolerance";
import { describe, expect, test } from "vitest";

describe(isWithinVerifyTolerance, () => {
  test.each([
    [0, true],
    [0.39, true],
    [VERIFY_TOLERANCE_PERCENT, true],
    [VERIFY_TOLERANCE_PERCENT + 0.1, false],
    [30, false],
  ])("decides a mean difference of %s percent as within tolerance: %s", (meanDifferencePercent, expected) => {
    expect.hasAssertions();

    expect(isWithinVerifyTolerance(meanDifferencePercent)).toStrictEqual(expected);
  });
});
