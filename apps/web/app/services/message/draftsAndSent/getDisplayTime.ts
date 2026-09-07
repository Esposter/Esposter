import { formatDate } from "#shared/util/date/formatDate";

const DISPLAY_TIME_FORMAT = "h:mm A";

export const getDisplayTime = (date: Date) => formatDate(date, DISPLAY_TIME_FORMAT);
