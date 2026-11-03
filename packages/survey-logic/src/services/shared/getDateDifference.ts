import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getDaysBetween } from "#src/services/shared/getDaysBetween";

// The days, the whole months or the whole years from one date to another.
// Years are the whole months divided by twelve and truncated.
// An interval SurveyJS does not know counts years, so an unknown interval reads as years.
export const getDateDifference = (from: Date, to: Date, interval: SurveyLogicValue): number => {
  if (interval === "days") return getDaysBetween(from, to);

  const monthsApart = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
  // A month is whole only once the later date reaches the day the earlier one fell on
  const wholeMonths = to.getDate() < from.getDate() ? monthsApart - 1 : monthsApart;

  return interval === "months" ? wholeMonths : Math.trunc(wholeMonths / 12) || 0;
};
