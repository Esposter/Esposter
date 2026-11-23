import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { HostedAssetLock } from "hosted-assets";

// The lock a publication names and every record that lock reaches, each record once
export interface HostedAssetPlan {
  lock: HostedAssetLock;
  records: HostedAssetRecord[];
}
