import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { RegionCityIds } from "#src/models/leyLine/RegionCityIds";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// The achievement event of a region's statue level rising, its quantity the level reached and its target the city the
// Joined city table names the region by. A level that does not rise, and a region the table names no city for, emit
// Nothing
export const computeStatueLevelEvents = (
  regionId: string,
  previousLevel: number,
  level: number,
  regionCityIds: RegionCityIds,
): AchievementEvent[] => {
  const cityId: number | undefined = regionCityIds[regionId];
  if (cityId === undefined || level <= previousLevel) return [];
  return [{ kind: AchievementEventKind.StatueLevelReached, quantity: level, targetId: String(cityId) }];
};
