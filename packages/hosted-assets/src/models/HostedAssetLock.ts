import type { HostedAssetObject } from "#src/models/HostedAssetObject";

import { hostedAssetObjectSchema } from "#src/models/HostedAssetObject";
import { z } from "zod";

// A product's committed lock: each key its code names mapped to the object that key reads, for a record read by its
// Key (`objects`) and for an index that maps an entry id to the object of that entry (`indexes`)
export interface HostedAssetLock {
  indexes: Record<string, HostedAssetObject>;
  objects: Record<string, HostedAssetObject>;
}

export const hostedAssetLockSchema: z.ZodType<HostedAssetLock> = z.object({
  indexes: z.record(z.string(), hostedAssetObjectSchema),
  objects: z.record(z.string(), hostedAssetObjectSchema),
});
