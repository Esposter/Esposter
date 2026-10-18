import type { ForgeProgress } from "#src/models/forging/ForgeProgress";

import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";

// A forge with nothing learned or ordered, its forge points counted from the game day `now` falls on
export const createForgeProgress = (now: Temporal.Instant): ForgeProgress => ({
  forgedPoints: 0,
  forgedPointsDay: now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate(),
  learnedRecipeIds: [],
  orders: [],
});
