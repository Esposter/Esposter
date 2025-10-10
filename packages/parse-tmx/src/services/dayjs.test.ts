import baseDayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { describe } from "vitest";

baseDayjs.extend(duration);

export const dayjs: typeof baseDayjs = baseDayjs;

describe.todo(dayjs);
