import baseDayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";

baseDayjs.extend(duration);

export const dayjs: typeof baseDayjs = baseDayjs;
