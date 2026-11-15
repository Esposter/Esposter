// The tier is what a user's blob-storage allowance is derived from, never a copy of the allowance itself —
// Moving a user to another tier changes their limit instantly, with nothing to backfill. Only `Free` exists
// Today; the enum is here so a paid tier is a value add rather than a schema change.
export const StorageTier = { Free: "Free" } as const;
export type StorageTier = (typeof StorageTier)[keyof typeof StorageTier];
