import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

import { kitValueSourceSchema } from "#src/models/genshinAssets/kits/KitValueSource";
import { z } from "zod";

// A character's entry of the `kitSources` index: the gcsim tag its gcsim values are read at, and how each value of its
// Record is known, by the value's path in the record
export interface KitSources {
  gcsimTag: string;
  values: Record<string, KitValueSource>;
}

export const kitSourcesSchema: z.ZodType<KitSources> = z.object({
  gcsimTag: z.string().min(1),
  values: z.record(z.string(), kitValueSourceSchema),
});
