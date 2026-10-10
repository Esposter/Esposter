import type { GameDataPruneResult } from "#src/models/gameData/GameDataPruneResult";
import type { PruneGameDataOptions } from "#src/models/gameData/PruneGameDataOptions";

import { GAME_DATA_RETENTION_MS } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { deleteBlobs, listBlobItems } from "@esposter/db";
import { GAME_DATA_BLOB_PATH } from "genshin-world";

// Deletes what no live lock reaches and what is older than retention. The batch carries the cutoff as its condition: an
// Object a publish rewrote after the listing was modified past it and is refused, so it is kept, which closes the race
// Between a reuse and a delete without a lease
export const pruneGameData = async ({
  containerClient,
  isDryRun,
  liveHashes,
  now,
}: PruneGameDataOptions): Promise<GameDataPruneResult> => {
  const liveBlobNames = new Set(Array.from(liveHashes, getGameDataBlobName));
  const cutoff = new Date(now - GAME_DATA_RETENTION_MS);
  const candidateNames = (await listBlobItems(containerClient, `${GAME_DATA_BLOB_PATH}/`))
    .filter(({ lastModified, name }) => !liveBlobNames.has(name) && lastModified < cutoff)
    .map(({ name }) => name);
  if (isDryRun) return { candidateCount: candidateNames.length, deletedCount: 0, keptCount: 0 };
  const keptNames = await deleteBlobs(containerClient, candidateNames, { ifUnmodifiedSince: cutoff });
  return {
    candidateCount: candidateNames.length,
    deletedCount: candidateNames.length - keptNames.length,
    keptCount: keptNames.length,
  };
};
