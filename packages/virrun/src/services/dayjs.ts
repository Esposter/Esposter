import baseDayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
// The duration-extended dayjs for runtime code (timeouts, intervals), so a millisecond budget is written as a
// Readable `dayjs.duration(5, "seconds").asMilliseconds()` rather than a bare magic number. virrun bundles
// Self-contained (rolldown external: []), so dayjs is vendored regardless. The `.test` sibling configures the same
// Plugin for test/bench timeouts.
baseDayjs.extend(duration);

export const dayjs: typeof baseDayjs = baseDayjs;
