import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";

import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";

// A check's state once its readings are in: not met with the items that fail it named, else not measurable with the
// Readings it could not take named, else met. A check is never met while a reading is unread
export const getExitCheck = (name: string, failing: string[], unmeasured: string[]): GenshinExitCheck => {
  if (failing.length > 0) return { name, notes: failing, state: GenshinExitCheckState.NotMet };
  if (unmeasured.length > 0) return { name, notes: unmeasured, state: GenshinExitCheckState.NotMeasurable };
  return { name, notes: [], state: GenshinExitCheckState.Met };
};
