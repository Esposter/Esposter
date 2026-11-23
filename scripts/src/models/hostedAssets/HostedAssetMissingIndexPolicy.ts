// What a read of a bucket's reachable objects does when a lock names an index the bucket lacks: a prune aborts, since it would
// Delete what that index names, and a publish skips it, since it only writes and stores the index again
export const HostedAssetMissingIndexPolicy = { Abort: "abort", Skip: "skip" } as const;
export type HostedAssetMissingIndexPolicy =
  (typeof HostedAssetMissingIndexPolicy)[keyof typeof HostedAssetMissingIndexPolicy];
