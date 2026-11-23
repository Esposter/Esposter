import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";

// What a preload holds: every file the product names, and the scope prefixes of the cache entries that a successful
// Preload may evict, since a prefix is one product's and the cache is shared by every product
export interface HostedAssetPreloadSet {
  files: HostedAssetDownloadFile[];
  scopePrefixes: string[];
}
