import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { HostedAssetName } from "hosted-assets";

export interface PruneHostedAssetsOptions extends DryRunOptions {
  bucketClient: R2BucketClient;
  // Every object a live lock reaches, which a prune keeps whatever its age
  liveObjects: HostedAssetName[];
  // The instant the retention window ends at, in epoch milliseconds
  now: number;
  // The scopes a product's lock may name, so only an object under one of them is a candidate
  scopes: readonly string[];
}
