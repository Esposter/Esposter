import { formatDate } from "#shared/util/date/formatDate";
import { checkIsToday, checkIsYesterday } from "@esposter/shared";

const TIMELINE_DATE_FORMAT = "dddd, MMMM Do";

export const getTimelineDateLabel = (date: Date) => {
  if (checkIsToday(date)) return "Today";
  else if (checkIsYesterday(date)) return "Yesterday";
  else return formatDate(date, TIMELINE_DATE_FORMAT);
};
