import { dayjs } from "#shared/services/dayjs";

export const getTimelineDateLabel = (date: Date) => {
  const dateDayjs = dayjs(date);
  if (dateDayjs.isToday()) return "Today";
  if (dateDayjs.isYesterday()) return "Yesterday";
  return dateDayjs.format("dddd, MMMM Do");
};
