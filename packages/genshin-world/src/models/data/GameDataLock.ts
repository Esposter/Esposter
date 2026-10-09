import { z } from "zod";

// The committed map from each key a reader names to the sha256 of the object it reads: `objects` for a record read by
// Its key, `indexes` for an index object that maps an entry id to the sha256 of that entry's record
export interface GameDataLock {
  indexes: Record<string, string>;
  objects: Record<string, string>;
}

export const gameDataLockSchema = z.object({
  indexes: z.record(z.string(), z.hash("sha256")),
  objects: z.record(z.string(), z.hash("sha256")),
}) satisfies z.ZodType<GameDataLock>;
