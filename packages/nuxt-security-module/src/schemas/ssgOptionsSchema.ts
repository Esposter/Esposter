import type { SsgOptions } from "#src/models/SsgOptions";

import * as z from "zod";

export const ssgOptionsSchema: z.ZodType<SsgOptions> = z.strictObject({
  exportToPresets: z.boolean(),
  hashScripts: z.boolean(),
  hashStyles: z.boolean(),
  meta: z.boolean(),
  nitroHeaders: z.boolean(),
});
