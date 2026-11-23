import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_VERIFY_FETCHES } from "#src/services/gameData/constants";
import { verifyGameDataObject } from "#src/services/gameData/verifyGameDataObject";
import { settleAll } from "@esposter/shared";
import { readGameDataReachableRefs } from "genshin-world";

// Every object the lock reaches, as one account serves it. Each index is fetched and checked as it is read, and each
// Object the lock names or an index names is fetched once however many names reach it. Resolves to how many distinct
// Objects were checked, the indexes included
export const verifyGameData = async (baseUrl: string, lock: HostedAssetLock): Promise<number> => {
  const { indexes, objects } = await readGameDataReachableRefs([lock], (index) => verifyGameDataObject(baseUrl, index));
  await settleAll(
    objects.map((ref) => () => verifyGameDataObject(baseUrl, ref)),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return indexes.length + objects.length;
};
