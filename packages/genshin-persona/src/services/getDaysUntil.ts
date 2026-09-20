import { LEAP_YEAR } from "#src/services/constants";

// The forward distance around the year, so late December reaches early January in a few days rather than most of a
// year, and a day reaches itself in zero. Both dates are read into the one leap year here rather than at the call
// sites, so neither a birthday nor today can be handed over in the wrong year
export const getDaysUntil = (from: Temporal.PlainDate, to: Temporal.PlainDate): number => {
  const start = from.with({ year: LEAP_YEAR });
  const end = to.with({ year: LEAP_YEAR });
  return (end.dayOfYear - start.dayOfYear + start.daysInYear) % start.daysInYear;
};
