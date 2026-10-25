import type { SsgOptions } from "#src/models/SsgOptions";

import { z } from "zod";

export const ssgOptionsSchema: z.ZodType<SsgOptions> = z.strictObject({
  hashScripts: z.boolean(),
  hashStyles: z.boolean(),
  meta: z.boolean(),
});
