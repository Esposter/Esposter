import type { HostedAssetName } from "#src/models/HostedAssetName";

// The path an object is stored at in its bucket, and is served at under any origin: its scope, then its name. The name
// Is The sha256 of the bytes, so the same bytes always have this path and a changed file has another
export const getHostedAssetPath = ({ extension, scope, sha256 }: HostedAssetName): string =>
  `${scope}/${sha256}${extension}`;
