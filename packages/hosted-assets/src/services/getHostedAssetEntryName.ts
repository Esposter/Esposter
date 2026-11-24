import type { HostedAssetName } from "#src/models/HostedAssetName";

// The name an entry of an index is stored under: its index's scope and extension, with the entry's own sha256. A
// Reader and the walk over a lock both name an entry this way, so they fetch the same object
export const getHostedAssetEntryName = (index: HostedAssetName, sha256: string): HostedAssetName => ({
  extension: index.extension,
  scope: index.scope,
  sha256,
});
