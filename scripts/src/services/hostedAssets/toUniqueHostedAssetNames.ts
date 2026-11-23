import type { HostedAssetName } from "hosted-assets";

import { getHostedAssetPath } from "hosted-assets";

// One name per stored object, the first that names it kept, so an object named twice is fetched or read once
export const toUniqueHostedAssetNames = (names: HostedAssetName[]): HostedAssetName[] => [
  ...new Map(names.map((name) => [getHostedAssetPath(name), name] as const)).values(),
];
