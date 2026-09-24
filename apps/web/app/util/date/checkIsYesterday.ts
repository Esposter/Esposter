import { getPlainDate } from "@/util/date/getPlainDate";

export const checkIsYesterday = (date: Date) =>
  getPlainDate(date).equals(Temporal.Now.plainDateISO().subtract({ days: 1 }));
