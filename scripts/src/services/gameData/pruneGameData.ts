import type { GameDataPruneResult } from "#src/models/gameData/GameDataPruneResult";
import type { PruneGameDataOptions } from "#src/models/gameData/PruneGameDataOptions";

import { GAME_DATA_RETENTION_MS } from "#src/services/gameData/constants";
import { toGameDataBlobNames } from "#src/services/gameData/toGameDataBlobNames";
import { deleteBlobs, listBlobItems } from "@esposter/db";

// Deletes what no live lock reaches and what is older than retention. The batch carries the cutoff as its condition: an
// Object a publish rewrote after the listing was modified past it and is refused, so it is kept, which closes the race
// Between a reuse and a delete without a lease
export const pruneGameData = async ({
  containerClient,
  isDryRun,
  liveObjects,
  now,
}: PruneGameDataOptions): Promise<GameDataPruneResult> => {
  const liveBlobNames = toGameDataBlobNames(liveObjects);
  const cutoff = new Date(now - GAME_DATA_RETENTION_MS);
  const candidateNames = (await listBlobItems(containerClient, ""))
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
