import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";
import type { CloudflareEnvironment } from "@esposter/db-schema";
import type { HostedAssetLock } from "hosted-assets";

export interface PublishHostedAssetsOptions {
  // Makes the buckets to publish to, absent for a dry run, which reads and writes no bucket and needs no credential. It is
  // Called only once a publication stores an object or drops a lock entry, so an empty publication that leaves the lock as it
  // Is makes no bucket and no credential
  createBucketClientMap?: (() => Record<CloudflareEnvironment, R2BucketClient>) | undefined;
  // The lock as the working tree has it, which the publication replaces the scopes of
  currentLock: HostedAssetLock;
  product: HostedAssetProduct;
  publication: HostedAssetPublication;
  // The scopes the publication replaces wholesale, or the single keys it replaces, and no other entry of the lock is touched
  scopes: string[];
}
