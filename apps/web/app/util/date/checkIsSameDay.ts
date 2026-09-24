import { getPlainDate } from "@/util/date/getPlainDate";

export const checkIsSameDay = (date: Date, otherDate: Date) => getPlainDate(date).equals(getPlainDate(otherDate));
