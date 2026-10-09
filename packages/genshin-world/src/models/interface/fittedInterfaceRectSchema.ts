import type { FittedInterfaceRect } from "genshin-interface";

import { z } from "zod";

// A RectTransform as a screen's fit publishes it, read back from the hosted game data. The interface library holds the
// Type and no zod, so its schema lives with the readers
export const fittedInterfaceRectSchema = z.object({
  anchorMax: z.array(z.number()),
  anchorMin: z.array(z.number()),
  pivot: z.array(z.number()),
  position: z.array(z.number()),
  scale: z.array(z.number()).optional(),
  size: z.array(z.number()),
}) satisfies z.ZodType<FittedInterfaceRect>;
