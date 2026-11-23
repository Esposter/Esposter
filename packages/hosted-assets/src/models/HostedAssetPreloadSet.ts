import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";

// What a preload holds: every file the product names, and the scope prefixes of the cache entries a successful preload may evict.
// A prefix is one product's, since the cache is shared by every product.
export interface HostedAssetPreloadSet {
  files: HostedAssetDownloadFile[];
  scopePrefixes: string[];
}
