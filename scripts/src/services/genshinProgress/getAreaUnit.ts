import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinUnit } from "#src/models/genshinProgress/GenshinUnit";

import { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";
import { checkNeedsMet } from "#src/services/genshinProgress/checkNeedsMet";

// A compute page as one unit: done when it holds no item at all, runnable when a queue item's needs this machine meets,
// Blocked on the other machine when every queue item needs something it lacks, and otherwise waiting on the first blocker
// Its waiting items name
export const getAreaUnit = (
  { blockers, kind, needs, phase }: GenshinArea,
  capabilities: readonly string[],
): GenshinUnit => {
  if (needs.length === 0 && blockers.length === 0) return { blocker: "", kind, phase, state: GenshinUnitState.Done };
  if (needs.some((itemNeeds) => checkNeedsMet(itemNeeds, capabilities)))
    return { blocker: "", kind, phase, state: GenshinUnitState.Runnable };
  if (needs.length > 0) return { blocker: "", kind, phase, state: GenshinUnitState.Blocked };
  const [blocker = ""] = blockers;
  return { blocker, kind, phase, state: GenshinUnitState.Waiting };
};
