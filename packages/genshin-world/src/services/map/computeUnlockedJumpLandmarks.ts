import type { Landmark } from "#src/models/world/Landmark";

import { checkIsWeeklyBossEntryOpen } from "#src/services/bosses/checkIsWeeklyBossEntryOpen";
import { checkIsWeeklyBossEntrance } from "#src/services/map/checkIsWeeklyBossEntrance";

// The jump landmarks the player has unlocked, which the map, the minimap and the jump list offer as jump targets. A domain
// Entrance is one of them once unlocked, as a statue or a waypoint is. A weekly boss's Trounce Domain entrance is unlocked
// By its introducing quests instead, so it needs no resonance, and stays locked until they are done
export const computeUnlockedJumpLandmarks = (
  jumpLandmarks: readonly Landmark[],
  unlockedLandmarkIds: ReadonlySet<string>,
  completedMainQuestIds: ReadonlySet<string>,
): Landmark[] =>
  jumpLandmarks.filter((landmark) =>
    checkIsWeeklyBossEntrance(landmark)
      ? checkIsWeeklyBossEntryOpen(landmark.entryId, completedMainQuestIds)
      : unlockedLandmarkIds.has(landmark.id),
  );
