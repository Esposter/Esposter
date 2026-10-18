import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { FORGE_DAILY_POINT_CAP } from "#src/services/forging/constants";
import { computeGameDay } from "#src/services/time/computeGameDay";

// Whether `count` units of a recipe would take the game day's forge points past the cap at `now`. The points forged count
// From the game's day, which starts at its hour in the game's time zone, so a day's points restart when that day changes
export const checkIsForgeDailyCapReached = (
  recipe: ForgeRecipe,
  count: number,
  progress: ForgeProgress,
  now: Temporal.Instant,
): boolean => {
  const gameDay = computeGameDay(now);
  const forgedPoints = progress.forgedPointsDay.equals(gameDay) ? progress.forgedPoints : 0;
  return forgedPoints + recipe.forgePoint * count > FORGE_DAILY_POINT_CAP;
};
