import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

export default defineNuxtPlugin(() => {
  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);
  dayjs.extend(isToday);
  dayjs.extend(isYesterday);
});
