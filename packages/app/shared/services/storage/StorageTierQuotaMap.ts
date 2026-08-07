import { GIBIBYTE } from "#shared/services/app/constants";
import { StorageTier } from "@esposter/db-schema";

// The allowance is resolved from the tier on every read rather than copied onto the user row, so moving a
// User to another tier changes their limit instantly with nothing to backfill.
export const StorageTierQuotaMap = {
  [StorageTier.Free]: 10 * GIBIBYTE,
} as const satisfies Record<StorageTier, number>;
export type StorageTierQuotaMap = typeof StorageTierQuotaMap;
