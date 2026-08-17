import { dayjs } from "#shared/services/dayjs";
import { getShortTimeLabel } from "@/services/dayjs/getShortTimeLabel";

export const getMessageDateLabel = (date: Date) => {
  const dateDayjs = dayjs(date);
  if (dateDayjs.isToday()) return getShortTimeLabel(date);
  if (dateDayjs.isYesterday()) return `Yesterday at ${getShortTimeLabel(date)}`;
  return dateDayjs.format("DD/MM/YYYY H:mm");
};
