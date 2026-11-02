import { computeLastHourOfDay } from "#src/services/time/computeLastHourOfDay";
import { MINING_OUTCROP_REFRESH_HOUR } from "#src/services/time/constants";

// The mining outcrops' draw at or before `now`: the last 06:00 on the game's clock, so the previous day's draw stands until the next one
export const computeLastMiningOutcropDraw = (now: Temporal.Instant): Temporal.Instant =>
  computeLastHourOfDay(now, MINING_OUTCROP_REFRESH_HOUR).toInstant();
