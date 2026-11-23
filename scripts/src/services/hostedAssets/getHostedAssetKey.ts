import type { HostedAssetObject } from "hosted-assets";

// The key an object is stored under in its bucket, which is the path its url names: its scope, then its name
export const getHostedAssetKey = ({ extension, scope, sha256 }: HostedAssetObject): string =>
  `${scope}/${sha256}${extension}`;
