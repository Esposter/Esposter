import { getPlainDate } from "#src/util/date/getPlainDate";

export const checkIsSameDay = (date: Date, otherDate: Date) => getPlainDate(date).equals(getPlainDate(otherDate));
