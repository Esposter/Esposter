import type { DumpedQuestCondition } from "#src/models/genshinText/DumpedQuestCondition";
import type { QuestWait } from "genshin-world";

import { MINUTES_PER_DAY, MINUTES_PER_HOUR } from "genshin-engine";

// The wait a game time tick asks for: the whole days that have to pass since its step began, its first parameter, and the
// Hours of the day it has to be within, the condition's text written "from,to" (the first later than the last wraps
// Midnight). Undefined where the days are no count or the text is no window of hours of a day
export const readQuestWait = ({ parameters: [days = 0], text }: DumpedQuestCondition): QuestWait | undefined => {
  const groups = /^(?<fromHour>\d+),(?<toHour>\d+)$/u.exec(text)?.groups;
  if (!groups) return undefined;
  const fromHour = Number(groups.fromHour);
  const toHour = Number(groups.toHour);
  const hoursPerDay = MINUTES_PER_DAY / MINUTES_PER_HOUR;
  const dayCount = Number(days);
  return Number.isInteger(dayCount) && dayCount >= 0 && fromHour <= hoursPerDay && toHour <= hoursPerDay
    ? { days: dayCount, fromHour, toHour }
    : undefined;
};
