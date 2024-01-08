import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

export default defineNuxtPlugin(() => {
  dayjs.extend(advancedFormat);
  dayjs.extend(duration);
  dayjs.extend(isToday);
  dayjs.extend(isYesterday);
  dayjs.extend(relativeTime);
});
