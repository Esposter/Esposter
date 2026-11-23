import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetName } from "hosted-assets";

import { HOSTED_ASSET_CACHE_CONTROL } from "#src/services/hostedAssets/constants";
import { getHostedAssetPath, HOSTED_ASSET_CONTENT_TYPES } from "hosted-assets";

// Stores one object's stored bytes under its name, with the headers every hosted object is served with: its cache
// Lifetime, The content type its extension names, and the encoding its stored form carries. Resolves to whether this
// Call wrote it
export const putHostedAsset = (
  bucketClient: R2BucketClient,
  name: HostedAssetName,
  { body, contentEncoding }: { body: Uint8Array; contentEncoding?: string | undefined },
  isCreateOnly: boolean,
): Promise<boolean> =>
  bucketClient.put(getHostedAssetPath(name), new Uint8Array(body), {
    cacheControl: HOSTED_ASSET_CACHE_CONTROL,
    contentEncoding,
    contentType: HOSTED_ASSET_CONTENT_TYPES[name.extension],
    createOnly: isCreateOnly,
  });
