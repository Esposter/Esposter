import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { ContainerClient } from "@azure/storage-blob";

import { GAME_DATA_REUSE_WINDOW_MS, MAX_CONCURRENT_BLOB_UPLOADS } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { storeGameDataRecord } from "#src/services/gameData/storeGameDataRecord";
import { listBlobItems } from "@esposter/db";
import { settleAll } from "@esposter/shared";
import { GAME_DATA_BLOB_PATH } from "genshin-world";

// Stores what one account does not hold yet, and returns how many objects it wrote. A stored object is reused as it is
// When the current lock reaches it or it is young, and otherwise rewritten with the same bytes, which restarts its age so
// No prune can take it. Leaves are written before the indexes that name them, so an index never names a missing entry
export const publishGameDataToTarget = async (
  containerClient: ContainerClient,
  records: GameDataRecord[],
  reachableHashes: Set<string>,
  getCompressedJson: (record: GameDataRecord) => Promise<Buffer>,
): Promise<number> => {
  const listedBlobItems = await listBlobItems(containerClient, `${GAME_DATA_BLOB_PATH}/`);
  const lastModifiedMap = new Map(listedBlobItems.map(({ lastModified, name }) => [name, lastModified] as const));
  const now = Date.now();
  const writes = records
    .filter((record) => {
      const lastModified = lastModifiedMap.get(getGameDataBlobName(record.hash));
      return (
        lastModified === undefined ||
        !(reachableHashes.has(record.hash) || now - lastModified.getTime() < GAME_DATA_REUSE_WINDOW_MS)
      );
    })
    .map((record) => ({ isCreateOnly: !lastModifiedMap.has(getGameDataBlobName(record.hash)), record }));
  const writeRecord = async ({ isCreateOnly, record }: (typeof writes)[number]) =>
    storeGameDataRecord(containerClient, record, await getCompressedJson(record), isCreateOnly);
  const leafWrites = writes.filter(({ record }) => !record.isIndex);
  const indexWrites = writes.filter(({ record }) => record.isIndex);
  const leafResults = await settleAll(
    leafWrites.map((write) => () => writeRecord(write)),
    MAX_CONCURRENT_BLOB_UPLOADS,
  );
  const indexResults = await settleAll(
    indexWrites.map((write) => () => writeRecord(write)),
    MAX_CONCURRENT_BLOB_UPLOADS,
  );
  return [...leafResults, ...indexResults].filter(Boolean).length;
};
