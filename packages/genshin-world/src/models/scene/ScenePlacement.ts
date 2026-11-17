import type { ScenePlacement } from "genshin-engine";

import { z } from "zod";

export const scenePlacementSchema = z.object({
  materials: z.array(z.string().min(1)),
  mesh: z.string().min(1),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  scale: z.tuple([z.number(), z.number(), z.number()]),
}) satisfies z.ZodType<ScenePlacement>;
