import type { HostedAssetName } from "hosted-assets";

import { getHostedAssetPath } from "hosted-assets";

// The paths of a set of stored objects, for a membership test against what a bucket holds
export const toHostedAssetPaths = (names: HostedAssetName[]): Set<string> =>
  new Set(names.map((name) => getHostedAssetPath(name)));
