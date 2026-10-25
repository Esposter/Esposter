import { formatDate } from "#shared/util/date/formatDate";
import { SHORT_TIME_FORMAT } from "@/util/date/constants";

export const getShortTimeLabel = (date: Date) => formatDate(date, SHORT_TIME_FORMAT);
