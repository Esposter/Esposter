import { addSurveyLogicMonths } from "#src/services/shared/addSurveyLogicMonths";
import { getDaysBetween } from "#src/services/shared/getDaysBetween";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// The length of each time unit in milliseconds, counted on the wall clock
const millisecondsPerUnitMap: Record<string, number> = { hours: 3_600_000, minutes: 60_000, seconds: 1000 };

// A date's wall clock as a count of milliseconds: its local fields read as if they were UTC, so a daylight saving change cannot move them
const getWallClockMilliseconds = (date: Date): number =>
  Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );

// The time from one date to another in a unit: the days, the whole months or years, or the hours, minutes or seconds rounded up.
// The order of the two dates does not matter. Undefined for a unit the language does not know
export const getDateDifference = (first: Date, second: Date, unit: string): number | undefined => {
  const [from, to] = first.getTime() <= second.getTime() ? [first, second] : [second, first];
  if (unit === "days") return getDaysBetween(from, to);

  const milliseconds = getOwnValue(millisecondsPerUnitMap, unit);
  if (milliseconds !== undefined)
    return Math.ceil((getWallClockMilliseconds(to) - getWallClockMilliseconds(from)) / milliseconds);
  if (unit !== "months" && unit !== "years") return undefined;

  const monthsApart = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
  // A month is whole once it reaches the day and the time of day the earlier date falls on
  const anchor = new Date(from);
  addSurveyLogicMonths(anchor, monthsApart);
  const wholeMonths = getWallClockMilliseconds(anchor) > getWallClockMilliseconds(to) ? monthsApart - 1 : monthsApart;

  return unit === "months" ? wholeMonths : Math.trunc(wholeMonths / 12);
};
