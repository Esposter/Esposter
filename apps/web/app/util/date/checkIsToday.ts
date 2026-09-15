import { getPlainDate } from "@/util/date/getPlainDate";

export const checkIsToday = (date: Date): boolean => getPlainDate(date).equals(Temporal.Now.plainDateISO());
