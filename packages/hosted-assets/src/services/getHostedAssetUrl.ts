import type { HostedAssetObject } from "#src/models/HostedAssetObject";

// The url an object is served at under an origin, named by its scope, its sha256 and its extension. The origin is given
// Without a trailing slash, and the name is the sha256 of the bytes, so the same bytes always have this url and a
// Changed file has another
export const getHostedAssetUrl = (origin: string, { extension, scope, sha256 }: HostedAssetObject): string =>
  `${origin}/${scope}/${sha256}${extension}`;
