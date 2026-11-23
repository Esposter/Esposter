import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_VERIFY_FETCHES } from "#src/services/hostedAssets/constants";
import { getLockRefs } from "#src/services/hostedAssets/getLockRefs";
import { verifyHostedAssetObject } from "#src/services/hostedAssets/verifyHostedAssetObject";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { settleAll } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// Every object the lock reaches, as one origin serves it. Each index is fetched and checked as it is read, and each object
// The lock names or an index names is fetched once however many names reach it. Resolves to how many distinct objects were
// Checked, the indexes included
export const verifyHostedAssets = async (baseUrl: string, lock: HostedAssetLock): Promise<number> => {
  // The decoded length each lock entry records, by the path its object is stored under
  const lockedBytesMap = new Map(
    [...Object.values(lock.indexes), ...Object.values(lock.objects)].map((object) => [
      getHostedAssetPath(object),
      object.bytes,
    ]),
  );
  const { indexes, objects } = await getLockRefs(
    [lock],
    async (index) =>
      parseMachineJson(
        (await verifyHostedAssetObject(baseUrl, index, lockedBytesMap.get(getHostedAssetPath(index)))).toString("utf8"),
      ),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  await settleAll(
    objects.map((name) => () => verifyHostedAssetObject(baseUrl, name, lockedBytesMap.get(getHostedAssetPath(name)))),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return indexes.length + objects.length;
};
