import { formatDate } from "#shared/util/date/formatDate";
import { checkIsToday } from "#src/util/date/checkIsToday";
import { checkIsYesterday } from "#src/util/date/checkIsYesterday";
import { MESSAGE_DATE_FORMAT } from "#src/util/date/constants";
import { getShortTimeLabel } from "#src/util/date/getShortTimeLabel";

export const getMessageDateLabel = (date: Date) => {
  if (checkIsToday(date)) return getShortTimeLabel(date);
  else if (checkIsYesterday(date)) return `Yesterday at ${getShortTimeLabel(date)}`;
  else return formatDate(date, MESSAGE_DATE_FORMAT);
};
