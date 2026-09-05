import { getZonedDateTime } from "#src/util/date/getZonedDateTime";

// Measured back from the next day's start rather than by writing 23:59:59.999 into the clock fields, which
// Is a different instant on a day a DST transition makes longer or shorter.
export const getEndOfDay = (date: Date): Date =>
  new Date(getZonedDateTime(date).startOfDay().add({ days: 1 }).epochMilliseconds - 1);
