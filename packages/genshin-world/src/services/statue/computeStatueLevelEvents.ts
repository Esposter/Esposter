import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { StatueRegionCityIdMap } from "#src/services/statue/StatueRegionCityIdMap";

// The achievement event of a region's statue level rising, its quantity the level reached and its target the city the
// Table numbers it by. A level that does not rise, and a region with no city, emit nothing
export const computeStatueLevelEvents = (
  regionId: string,
  previousLevel: number,
  level: number,
): AchievementEvent[] => {
  const cityId: string | undefined = StatueRegionCityIdMap[regionId];
  if (cityId === undefined || level <= previousLevel) return [];
  return [{ kind: AchievementEventKind.StatueLevelReached, quantity: level, targetId: cityId }];
};
