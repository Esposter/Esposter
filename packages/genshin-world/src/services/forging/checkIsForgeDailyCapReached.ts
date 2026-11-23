import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { computeGameDay } from "#src/services/time/computeGameDay";

// Whether `count` units of a recipe would take the game day's forge points past `dailyPointCap` at `now`. The points
// Forged Count from the game's day, which starts at its hour in the game's time zone, so a day's points restart when
// That day changes
export const checkIsForgeDailyCapReached = (
  recipe: ForgeRecipe,
  count: number,
  progress: ForgeProgress,
  now: Temporal.Instant,
  dailyPointCap: number,
): boolean => {
  const gameDay = computeGameDay(now);
  const forgedPoints = progress.forgedPointsDay.equals(gameDay) ? progress.forgedPoints : 0;
  return forgedPoints + recipe.forgePoint * count > dailyPointCap;
};
