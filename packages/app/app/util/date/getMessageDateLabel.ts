import { formatDate } from "#shared/util/date/formatDate";
import { getShortTimeLabel } from "@/util/date/getShortTimeLabel";
import { checkIsToday, checkIsYesterday } from "@esposter/shared";

const MESSAGE_DATE_FORMAT = "DD/MM/YYYY H:mm";

export const getMessageDateLabel = (date: Date) => {
  if (checkIsToday(date)) return getShortTimeLabel(date);
  if (checkIsYesterday(date)) return `Yesterday at ${getShortTimeLabel(date)}`;
  return formatDate(date, MESSAGE_DATE_FORMAT);
};
