import baseDayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import utc from "dayjs/plugin/utc.js";

baseDayjs.extend(advancedFormat);
baseDayjs.extend(customParseFormat);
baseDayjs.extend(duration);
baseDayjs.extend(isSameOrBefore);
baseDayjs.extend(isToday);
baseDayjs.extend(isYesterday);
baseDayjs.extend(utc);

export const dayjs = baseDayjs;
