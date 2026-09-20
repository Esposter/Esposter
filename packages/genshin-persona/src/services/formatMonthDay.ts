import type { MonthDay } from "#src/models/MonthDay";

import { DATE_LOCALE, LEAP_YEAR } from "#src/services/constants";

// "20 September": the day as a person reads it, measured inside the leap year every month and day lives in
export const formatMonthDay = ({ day, month }: MonthDay): string =>
  new Date(Date.UTC(LEAP_YEAR, month - 1, day)).toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
