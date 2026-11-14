import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";
import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";

import {
  GAME_DATA_CACHE_CONTROL,
  GAME_DATA_REUSE_WINDOW_MS,
  MAX_CONCURRENT_OBJECT_REQUESTS,
} from "#src/services/gameData/constants";
import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";
import { toGameDataObjectKeys } from "#src/services/gameData/toGameDataObjectKeys";
import { settleAll } from "@esposter/shared";

// Stores what one bucket does not hold yet, and returns how many objects it wrote. A stored object is reused as it is when
// The current lock reaches it or it is young, and otherwise rewritten with the same bytes, which restarts its age so no
// Prune can take it. Leaves are written before the indexes that name them, so an index never names a missing entry
export const publishGameDataToBucket = async (
  bucketClient: R2BucketClient,
  records: GameDataRecord[],
  reachableObjects: GameDataObjectRef[],
  getCompressedJson: (record: GameDataRecord) => Promise<Buffer>,
): Promise<number> => {
  const lastModifiedMap = new Map(
    (await bucketClient.list("")).map(({ key, lastModified }) => [key, lastModified] as const),
  );
  const reachableKeys = toGameDataObjectKeys(reachableObjects);
  const now = Date.now();
  const writes = records
    .map((record) => ({ key: getGameDataObjectKey(record.dataset, record.hash), record }))
    .filter(({ key }) => {
      const lastModified = lastModifiedMap.get(key);
      return (
        lastModified === undefined ||
        !(reachableKeys.has(key) || now - lastModified.getTime() < GAME_DATA_REUSE_WINDOW_MS)
      );
    })
    .map(({ key, record }) => ({ isCreateOnly: !lastModifiedMap.has(key), key, record }));
  const writeRecord = async ({ isCreateOnly, key, record }: (typeof writes)[number]) =>
    bucketClient.put(key, await getCompressedJson(record), {
      cacheControl: GAME_DATA_CACHE_CONTROL,
      contentEncoding: "zstd",
      contentType: "application/json",
      createOnly: isCreateOnly,
    });
  const leafWrites = writes.filter(({ record }) => !record.isIndex);
  const indexWrites = writes.filter(({ record }) => record.isIndex);
  const leafResults = await settleAll(
    leafWrites.map((write) => () => writeRecord(write)),
    MAX_CONCURRENT_OBJECT_REQUESTS,
  );
  const indexResults = await settleAll(
    indexWrites.map((write) => () => writeRecord(write)),
    MAX_CONCURRENT_OBJECT_REQUESTS,
  );
  return [...leafResults, ...indexResults].filter(Boolean).length;
};
