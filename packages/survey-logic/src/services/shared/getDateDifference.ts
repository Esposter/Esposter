import { addSurveyLogicMonths } from "#src/services/shared/addSurveyLogicMonths";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getSurveyLogicDayNumber } from "#src/services/shared/getSurveyLogicDayNumber";

// The length of each time unit in milliseconds, counted on the wall clock
const millisecondsPerUnitMap: Record<string, number> = { hours: 3_600_000, minutes: 60_000, seconds: 1000 };

// The time from one wall-clock date to another in a unit: the calendar days, the whole months or years, or the hours, minutes
// Or seconds rounded up. The order of the two dates does not matter. Undefined for a unit the language does not know
export const getDateDifference = (first: Date, second: Date, unit: string): number | undefined => {
  const [from, to] = first.getTime() <= second.getTime() ? [first, second] : [second, first];
  if (unit === "days") return getSurveyLogicDayNumber(to) - getSurveyLogicDayNumber(from);

  const milliseconds = getOwnValue(millisecondsPerUnitMap, unit);
  if (milliseconds !== undefined) return Math.ceil((to.getTime() - from.getTime()) / milliseconds);
  if (unit !== "months" && unit !== "years") return undefined;

  const monthsApart = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + to.getUTCMonth() - from.getUTCMonth();
  // A month is whole once it reaches the day and the time of day the earlier date falls on
  const anchor = new Date(from);
  addSurveyLogicMonths(anchor, monthsApart);
  const wholeMonths = anchor.getTime() > to.getTime() ? monthsApart - 1 : monthsApart;

  return unit === "months" ? wholeMonths : Math.trunc(wholeMonths / 12);
};
