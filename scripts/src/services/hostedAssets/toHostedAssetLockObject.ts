import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { HostedAssetObject } from "hosted-assets";

// A record's lock entry: named by its sha256, and sized by the decoded bytes that hash names
export const toHostedAssetLockObject = ({ bytes, extension, scope, sha256 }: HostedAssetRecord): HostedAssetObject => ({
  bytes: bytes.byteLength,
  extension,
  scope,
  sha256,
});
