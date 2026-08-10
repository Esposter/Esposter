import baseDayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";

// Not a duplicate of db-schema's — see the comment there. A dayjs plugin augments the dayjs module, and a
// Module augmentation is program-scoped, so each package registers the plugins its own source needs.
baseDayjs.extend(duration);

export const dayjs = baseDayjs;
