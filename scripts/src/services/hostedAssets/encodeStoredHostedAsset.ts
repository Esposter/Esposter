import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { HOSTED_RECORD_EXTENSION } from "#src/services/hostedAssets/constants";
import { encodeHostedAssetObject } from "#src/services/hostedAssets/encodeHostedAssetObject";
import { encodeHostedAssetRecord } from "#src/services/hostedAssets/encodeHostedAssetRecord";

// The stored form of one object of a product: a records product's JSON records as zstd, and every other object as its
// Extension's table names, so a binary file a records product publishes keeps its own bytes. The publish and the repair both
// Store through it, so neither can encode an object the other would not
export const encodeStoredHostedAsset = (
  product: HostedAssetProduct,
  { bytes, extension }: { bytes: Buffer; extension: string },
): Promise<{ body: Uint8Array; contentEncoding?: string | undefined }> =>
  product.source.kind === "records" && extension === HOSTED_RECORD_EXTENSION
    ? encodeHostedAssetRecord(bytes)
    : encodeHostedAssetObject(extension, bytes);
