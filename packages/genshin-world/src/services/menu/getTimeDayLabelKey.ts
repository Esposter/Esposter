import { GameTextKey } from "genshin-text";

// The day word the hour the dial points at is labelled with, by the days it falls past the clock's own day: Today, then
// Tomorrow, then the day after. Every day count is one of those three, so the last word is the fallback rather than a
// Guess
export const getTimeDayLabelKey = (daysAhead: number): GameTextKey => {
  if (daysAhead === 0) return GameTextKey.TimeToday;
  if (daysAhead === 1) return GameTextKey.TimeTomorrow;
  return GameTextKey.TimeDayAfterTomorrow;
};
