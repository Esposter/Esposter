import { formatDate } from "#shared/util/date/formatDate";

const SHORT_TIME_FORMAT = "H:mm";

export const getShortTimeLabel = (date: Date) => formatDate(date, SHORT_TIME_FORMAT);
