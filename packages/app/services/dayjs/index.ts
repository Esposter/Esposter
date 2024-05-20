import baseDayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import duration from "dayjs/plugin/duration.js";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import relativeTime from "dayjs/plugin/relativeTime.js";

baseDayjs.extend(advancedFormat);
baseDayjs.extend(duration);
baseDayjs.extend(isToday);
baseDayjs.extend(isYesterday);
baseDayjs.extend(relativeTime);

export const dayjs = baseDayjs;
