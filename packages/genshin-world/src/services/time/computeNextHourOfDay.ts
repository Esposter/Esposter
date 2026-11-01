import { computeLastHourOfDay } from "#src/services/time/computeLastHourOfDay";

// The first `hour` o'clock on the game's clock strictly after `now`: the day after the last one at or before it
export const computeNextHourOfDay = (now: Temporal.Instant, hour: number): Temporal.Instant =>
  computeLastHourOfDay(now, hour).add({ days: 1 }).toInstant();
