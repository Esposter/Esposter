import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";

import { kitOverlayEntrySchema } from "#src/models/genshinAssets/kits/KitOverlayEntry";
import { KIT_VALUE_PATH_REGEX } from "#src/services/genshinAssets/kits/constants";
import { z } from "zod";

// A character's authored overlay, `src/data/kits/<character>.json`: each value its sources cannot give, by the value's
// Path in the record, `normalAttacks.0.hits.1.poiseDamage`, where a path ending in `length` sets an array's length
export type KitOverlay = Record<string, KitOverlayEntry>;

export const kitOverlaySchema: z.ZodType<KitOverlay> = z.record(
  z.string().regex(KIT_VALUE_PATH_REGEX),
  kitOverlayEntrySchema,
);
