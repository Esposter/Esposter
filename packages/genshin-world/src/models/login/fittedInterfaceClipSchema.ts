import type { FittedInterfaceClip } from "genshin-interface";

import { z } from "zod";

// An interface clip as a screen's fit publishes it, read back from the hosted game data. The interface library holds the
// Type and no zod, so its schema lives with the readers
export const fittedInterfaceClipSchema = z.object({
  durationMs: z.number(),
  tracks: z.array(z.object({ keyframes: z.array(z.array(z.number())), property: z.string(), target: z.string() })),
}) satisfies z.ZodType<FittedInterfaceClip>;
