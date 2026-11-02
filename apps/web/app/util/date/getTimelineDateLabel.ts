import { formatDate } from "#shared/util/date/formatDate";
import { checkIsToday } from "@/util/date/checkIsToday";
import { checkIsYesterday } from "@/util/date/checkIsYesterday";
import { TIMELINE_DATE_FORMAT, TIMELINE_DATE_WITH_YEAR_FORMAT } from "@/util/date/constants";
import { getPlainDate } from "@/util/date/getPlainDate";

// A day from another year names its year too, since without it two days sharing a weekday, month and day would be
// Headed the same, and a list running them one after the other would show them under one heading
export const getTimelineDateLabel = (date: Date) => {
  if (checkIsToday(date)) return "Today";
  else if (checkIsYesterday(date)) return "Yesterday";
  else if (getPlainDate(date).year === Temporal.Now.plainDateISO().year) return formatDate(date, TIMELINE_DATE_FORMAT);
  else return formatDate(date, TIMELINE_DATE_WITH_YEAR_FORMAT);
};
