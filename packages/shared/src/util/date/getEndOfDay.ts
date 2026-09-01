import { getZonedDateTime } from "#src/util/date/getZonedDateTime";

// The last instant of the calendar day a date falls in, so a range whose upper bound is a date includes
// Everything that happened on it. Measured back from the next day's start rather than by writing 23:59:59.999
// Into the clock fields, which is a different instant on a day a DST transition makes longer or shorter.
export const getEndOfDay = (date: Date): Date =>
  new Date(getZonedDateTime(date).startOfDay().add({ days: 1 }).epochMilliseconds - 1);
