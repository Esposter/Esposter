import { formatDate } from "#shared/util/date/formatDate";
import { checkIsToday } from "@/util/date/checkIsToday";
import { checkIsYesterday } from "@/util/date/checkIsYesterday";
import { TIMELINE_DATE_FORMAT } from "@/util/date/constants";

export const getTimelineDateLabel = (date: Date) => {
  if (checkIsToday(date)) return "Today";
  else if (checkIsYesterday(date)) return "Yesterday";
  else return formatDate(date, TIMELINE_DATE_FORMAT);
};
