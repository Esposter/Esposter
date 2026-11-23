import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_MIRROR_DOWNLOADS } from "#src/services/hostedAssets/constants";
import { getLockRefs } from "#src/services/hostedAssets/getLockRefs";
import { readMirroredHostedAsset } from "#src/services/hostedAssets/readMirroredHostedAsset";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { settleAll } from "@esposter/shared";
import { HOSTED_ASSETS_MIRROR_DIRECTORY } from "@esposter/shared-node/cache";

// Every object a lock reaches, read into the mirror: each index, then the lock's own objects and the entries those indexes
// Name, so a mirror saved after it holds every record a suite can read. Each object is checked against its name as it is
// Read, so a mirror holding one altered object fails the fill. Resolves to how many distinct objects the lock names
export const fillHostedAssetMirror = async (
  baseUrl: string,
  lock: HostedAssetLock,
  mirrorDirectory: string = HOSTED_ASSETS_MIRROR_DIRECTORY,
): Promise<number> => {
  const { indexes, objects } = await getLockRefs(
    [lock],
    async (index) =>
      parseMachineJson((await readMirroredHostedAsset(baseUrl, index, mirrorDirectory)).toString("utf8")),
    MAX_CONCURRENT_MIRROR_DOWNLOADS,
  );
  await settleAll(
    objects.map((name) => () => readMirroredHostedAsset(baseUrl, name, mirrorDirectory)),
    MAX_CONCURRENT_MIRROR_DOWNLOADS,
  );
  return indexes.length + objects.length;
};
