import type { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { CloudflareEnvironment } from "@esposter/db-schema";
import type { HostedAssetLock } from "hosted-assets";

// Each outcome carries only what it has: a dry run carries the lock it would leave and the records it would store, for
// The Caller to compare against what is published, and a published one the lock the caller commits and each account's
// Count
export type HostedAssetPublishResult =
  | {
      nextLock: HostedAssetLock;
      outcome: typeof HostedAssetPublishOutcome.DryRun;
      records: HostedAssetRecord[];
      storedObjectCount: number;
    }
  | {
      outcome: typeof HostedAssetPublishOutcome.Published;
      plannedLock: HostedAssetLock;
      storedObjectCount: number;
      uploadedCountMap: Record<CloudflareEnvironment, number>;
    }
  | { outcome: typeof HostedAssetPublishOutcome.Unchanged };
