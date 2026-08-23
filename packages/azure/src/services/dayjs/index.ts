import baseDayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
// A dayjs plugin augments the dayjs module, and a module augmentation is program-scoped, so each package
// Registers the plugins its own source needs rather than inheriting a sibling's registration.
baseDayjs.extend(duration);

export const dayjs: typeof baseDayjs = baseDayjs;
