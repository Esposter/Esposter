import type { AutoRecoverDwell } from "#src/models/statue/AutoRecoverDwell";

import { AUTO_RECOVER_DWELL_SECONDS } from "#src/services/statue/constants";

export interface AdvancedAutoRecoverDwell {
  dwell: AutoRecoverDwell;
  isDue: boolean;
}

// Advances a stand by a statue's base by a frame's seconds. A stand is due once, when it reaches the dwell, so its revive
// And heal run one time; a step away from the statue ends the stand, and the next one runs its own
export const advanceAutoRecoverDwell = (
  dwell: AutoRecoverDwell,
  isNearStatue: boolean,
  seconds: number,
): AdvancedAutoRecoverDwell => {
  if (!isNearStatue) return { dwell: { isRecovered: false, seconds: 0 }, isDue: false };
  const standingSeconds = Math.min(dwell.seconds + seconds, AUTO_RECOVER_DWELL_SECONDS);
  const isDue = !dwell.isRecovered && standingSeconds >= AUTO_RECOVER_DWELL_SECONDS;
  return { dwell: { isRecovered: dwell.isRecovered || isDue, seconds: standingSeconds }, isDue };
};
