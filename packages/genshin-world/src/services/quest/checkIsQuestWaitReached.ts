import type { QuestWait } from "#src/models/quest/QuestWait";

import { MINUTES_PER_HOUR } from "genshin-engine";

// A wait is reached once its days have passed since the step began and the clock reads within its hours, from the first
// Up to the last, or from the first through midnight to the last when the first is the later
export const checkIsQuestWaitReached = (
  { days, fromHour, toHour }: QuestWait,
  elapsedDays: number,
  minutes: number,
): boolean => {
  if (elapsedDays < days) return false;
  const from = fromHour * MINUTES_PER_HOUR;
  const to = toHour * MINUTES_PER_HOUR;
  return from <= to ? minutes >= from && minutes < to : minutes >= from || minutes < to;
};
