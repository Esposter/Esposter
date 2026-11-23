import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { HostedAssetObject } from "hosted-assets";

// A record's lock entry: named by its sha256, and sized by the UTF-8 bytes of the JSON that hash names
export const toHostedAssetLockObject = ({ extension, json, scope, sha256 }: HostedAssetRecord): HostedAssetObject => ({
  bytes: Buffer.byteLength(json),
  extension,
  scope,
  sha256,
});
