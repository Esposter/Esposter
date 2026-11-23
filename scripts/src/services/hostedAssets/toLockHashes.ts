import type { HostedAssetObject } from "hosted-assets";

// The sha256 each entry of a lock map names, for the comparisons that read a lock by its hashes alone
export const toLockHashes = (objectMap: Record<string, HostedAssetObject>): Record<string, string> =>
  Object.fromEntries(Object.entries(objectMap).map(([key, { sha256 }]) => [key, sha256]));
