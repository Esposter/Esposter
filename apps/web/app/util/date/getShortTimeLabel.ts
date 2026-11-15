import { formatDate } from "#shared/util/date/formatDate";
import { SHORT_TIME_FORMAT } from "#src/util/date/constants";

export const getShortTimeLabel = (date: Date) => formatDate(date, SHORT_TIME_FORMAT);
