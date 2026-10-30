import { VERIFY_TOLERANCE_PERCENT } from "#src/services/genshinParity/reference/constants";

// Whether a reference's mean difference from the frame its source names is within the tolerance `verify` allows
export const checkIsWithinVerifyTolerance = (meanDifferencePercent: number): boolean =>
  meanDifferencePercent <= VERIFY_TOLERANCE_PERCENT;
