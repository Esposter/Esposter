import { getZonedDateTime } from "#src/util/date/getZonedDateTime";

// The calendar day an instant falls on for the reader, which is what every same-day/today comparison is
// Actually comparing — two instants milliseconds apart can be different days, and two hours apart the same one.
export const getPlainDate = (date: Date): Temporal.PlainDate => getZonedDateTime(date).toPlainDate();
