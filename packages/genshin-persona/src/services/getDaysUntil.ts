import type { MonthDay } from "#src/models/MonthDay";

import { DAY_IN_MILLISECONDS, DAYS_IN_LEAP_YEAR, LEAP_YEAR } from "#src/services/constants";

const getDayOfYear = ({ day, month }: MonthDay) =>
  Math.round((Date.UTC(LEAP_YEAR, month - 1, day) - Date.UTC(LEAP_YEAR, 0, 1)) / DAY_IN_MILLISECONDS);

// The forward distance around the year, so late December reaches early January in a few days rather than most of a
// Year, and a day reaches itself in zero
export const getDaysUntil = (from: MonthDay, to: MonthDay): number => {
  const fromDayOfYear = getDayOfYear(from);
  const toDayOfYear = getDayOfYear(to);
  return (toDayOfYear - fromDayOfYear + DAYS_IN_LEAP_YEAR) % DAYS_IN_LEAP_YEAR;
};
