import { getPlainDate } from "#src/util/date/getPlainDate";

// Whether two instants land on the same calendar day for the reader — the comparison a day divider and a
// "not after today" bound both make, and one no instant comparison expresses.
export const checkIsSameDay = (date: Date, otherDate: Date): boolean =>
  getPlainDate(date).equals(getPlainDate(otherDate));
