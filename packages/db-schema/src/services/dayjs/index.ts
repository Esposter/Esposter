import baseDayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";

// Every package that writes a millisecond budget registers the duration plugin itself. A dayjs plugin is a
// `declare module "dayjs"` augmentation, which TypeScript resolves per program against the dayjs module
// Identity, so it cannot be re-exported: neither `import type {} from "dayjs/plugin/duration"` nor a
// `/// <reference types>` directive survives the bundled `.d.ts`, and externalising dayjs does not help
// Either — the consumer still needs the plugin's own declarations in its program before `.duration` resolves.
baseDayjs.extend(duration);

export const dayjs = baseDayjs;
