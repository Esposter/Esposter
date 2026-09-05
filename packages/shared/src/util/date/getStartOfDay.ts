import { getZonedDateTime } from "#src/util/date/getZonedDateTime";

// Derived from `startOfDay` rather than by zeroing the clock fields, so a day that begins at 01:00 because
// Of a DST transition still starts where the calendar says it does.
export const getStartOfDay = (date: Date): Date => new Date(getZonedDateTime(date).startOfDay().epochMilliseconds);
