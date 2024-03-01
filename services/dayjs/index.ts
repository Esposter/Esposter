import baseDayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

baseDayjs.extend(advancedFormat);
baseDayjs.extend(duration);
baseDayjs.extend(isToday);
baseDayjs.extend(isYesterday);
baseDayjs.extend(relativeTime);

export const dayjs = baseDayjs;
