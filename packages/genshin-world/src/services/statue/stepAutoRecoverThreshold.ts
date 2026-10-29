import {
  AUTO_RECOVER_THRESHOLD_MAXIMUM_PERCENT,
  AUTO_RECOVER_THRESHOLD_STEP_PERCENT,
} from "#src/services/statue/constants";

// The threshold one step up (a direction of one) or down (minus one) the Blessing's control moves it by, held between one
// Step and the maximum so a press past either end changes nothing
export const stepAutoRecoverThreshold = (thresholdPercent: number, direction: 1 | -1): number =>
  Math.min(
    AUTO_RECOVER_THRESHOLD_MAXIMUM_PERCENT,
    Math.max(AUTO_RECOVER_THRESHOLD_STEP_PERCENT, thresholdPercent + direction * AUTO_RECOVER_THRESHOLD_STEP_PERCENT),
  );
