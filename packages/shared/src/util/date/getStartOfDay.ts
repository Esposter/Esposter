import { getZonedDateTime } from "#src/util/date/getZonedDateTime";

// The first instant of the calendar day a date falls in, in the reader's own zone. Derived from `startOfDay`
// Rather than by zeroing the clock fields, so a day that begins at 01:00 because of a DST transition still
// Starts where the calendar says it does.
export const getStartOfDay = (date: Date): Date => new Date(getZonedDateTime(date).startOfDay().epochMilliseconds);
