import { z } from "zod";

// The tier is what a user's blob-storage allowance is derived from, never a copy of the allowance itself —
// Moving a user to another tier changes their limit instantly, with nothing to backfill. Only `Free` exists
// Today; the enum is here so a paid tier is a value add rather than a schema change.
export enum StorageTier {
  Free = "Free",
}

export const storageTierSchema = z.enum(StorageTier) satisfies z.ZodType<StorageTier>;

export const StorageTiers: readonly StorageTier[] = Object.values(StorageTier);
