import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinUnit } from "#src/models/genshinProgress/GenshinUnit";

import { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";
import { checkNeedsMet } from "#src/services/genshinProgress/checkNeedsMet";
import { GENSHIN_MISSING_ID_BLOCKER } from "#src/services/genshinProgress/constants";

// A compute page as one unit: done when it holds no item at all, an open line with no id included, runnable when a queue
// Item's needs this machine meets, blocked on the other machine when every queue item needs something it lacks, and
// Otherwise waiting on the first blocker its waiting items name, or on the missing id when no waiting item names one
export const getAreaUnit = (
  { blockers, kind, needs, phase, skipped }: GenshinArea,
  capabilities: readonly string[],
): GenshinUnit => {
  if (needs.length === 0 && blockers.length === 0 && skipped === 0)
    return { blocker: "", kind, phase, state: GenshinUnitState.Done };
  if (needs.some((itemNeeds) => checkNeedsMet(itemNeeds, capabilities)))
    return { blocker: "", kind, phase, state: GenshinUnitState.Runnable };
  if (needs.length > 0) return { blocker: "", kind, phase, state: GenshinUnitState.Blocked };
  // No queue item is left, so the page is waiting: on its first waiting item's blocker, or on the open line with no id
  const [blocker = GENSHIN_MISSING_ID_BLOCKER] = blockers;
  return { blocker, kind, phase, state: GenshinUnitState.Waiting };
};
