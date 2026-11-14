import { StorageTier } from "#src/models/user/StorageTier";
import { z } from "zod";

// The quota rides along with the usage rather than being resolved on the client: it is derived from the tier,
// And a bar that reads its own denominator off a map the server did not gate on can disagree with the gate.
export interface StorageUsage {
  bytesUsed: number;
  quotaBytes: number;
  tier: StorageTier;
}

export const storageUsageSchema = z.object({
  bytesUsed: z.int().nonnegative(),
  quotaBytes: z.int().nonnegative(),
  tier: z.enum(StorageTier) satisfies z.ZodType<StorageTier>,
}) satisfies z.ZodType<StorageUsage>;
