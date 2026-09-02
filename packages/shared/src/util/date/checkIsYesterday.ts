import { getPlainDate } from "#src/util/date/getPlainDate";

export const checkIsYesterday = (date: Date): boolean =>
  getPlainDate(date).equals(Temporal.Now.plainDateISO().subtract({ days: 1 }));
