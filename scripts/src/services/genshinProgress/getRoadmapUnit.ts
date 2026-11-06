import type { GenshinRoadmapItem } from "#src/models/genshinProgress/GenshinRoadmapItem";
import type { GenshinUnit } from "#src/models/genshinProgress/GenshinUnit";

import { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";
import { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";

// A roadmap item as one unit: an item that names no quest is runnable until ticked. A quest's item is done when ticked,
// Scripted when a session script names the quest, and not measurable when none does, so a script never makes it done
export const getRoadmapUnit = (
  { isDone, phase, quest }: GenshinRoadmapItem,
  scriptedQuests: readonly string[],
): GenshinUnit => {
  if (quest === undefined)
    return {
      blocker: "",
      kind: GenshinProgressKind.Item,
      phase,
      state: isDone ? GenshinUnitState.Done : GenshinUnitState.Runnable,
    };
  if (isDone) return { blocker: "", kind: GenshinProgressKind.Quest, phase, quest, state: GenshinUnitState.Done };
  const state = scriptedQuests.includes(quest) ? GenshinUnitState.Scripted : GenshinUnitState.NotMeasurable;
  return { blocker: "", kind: GenshinProgressKind.Quest, phase, quest, state };
};
