import type { StorageTier } from "@esposter/db-schema";

// The quota rides along with the usage rather than being resolved on the client: it is derived from the tier,
// And a bar that reads its own denominator off a map the server did not gate on can disagree with the gate.
export interface StorageUsage {
  bytesUsed: number;
  quotaBytes: number;
  tier: StorageTier;
}
