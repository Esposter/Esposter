import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { FORGE_DAILY_POINT_CAP } from "#src/services/forging/constants";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// Whether `count` units of a recipe would take the game day's forge points past the cap at `now`. The points forged count
// From the game's day, which starts at its hour in the game's time zone, so a day's points restart when that day changes
export const checkIsForgeDailyCapReached = (
  recipe: ForgeRecipe,
  count: number,
  progress: ForgeProgress,
  now: Temporal.Instant,
): boolean => {
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const forgedPoints = progress.forgedPointsDay.equals(gameDay) ? progress.forgedPoints : 0;
  return forgedPoints + recipe.forgePoint * count > FORGE_DAILY_POINT_CAP;
};
