import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { encodeHostedAssetObject } from "#src/services/hostedAssets/encodeHostedAssetObject";
import { encodeHostedAssetRecord } from "#src/services/hostedAssets/encodeHostedAssetRecord";

// The stored form of one object of a product: a records product's JSON as zstd, a files product's bytes as their extension's
// Table names. The publish and the repair both store through it, so neither can encode an object the other would not
export const encodeStoredHostedAsset = (
  product: HostedAssetProduct,
  { bytes, extension }: { bytes: Buffer; extension: string },
): Promise<{ body: Uint8Array; contentEncoding?: string | undefined }> =>
  product.source.kind === "records" ? encodeHostedAssetRecord(bytes) : encodeHostedAssetObject(extension, bytes);
