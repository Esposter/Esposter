import type { HostedAssetName } from "#src/models/HostedAssetName";

import { getHostedAssetPath } from "#src/services/getHostedAssetPath";

// The url an object is served at under an origin, given without a trailing slash. The name is the sha256 of the bytes,
// So the same bytes always have this url and a changed file has another
export const getHostedAssetUrl = (origin: string, object: HostedAssetName): string =>
  `${origin}/${getHostedAssetPath(object)}`;
