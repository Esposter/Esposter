import type { GameDataPruneResult } from "#src/models/gameData/GameDataPruneResult";
import type { PruneGameDataOptions } from "#src/models/gameData/PruneGameDataOptions";

import { GAME_DATA_RETENTION_MS } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { deleteBlobs, listBlobItems } from "@esposter/db";
import { CHARACTER_PACK_BLOB_PATH, GAME_DATA_BLOB_PATH } from "genshin-world";

// Deletes what no live lock reaches and what is older than retention: each object by its own hash, and each file of a
// Character's pack by the hash of the pack's record, the folder it sits in after its character's id. The batch carries
// The cutoff as its condition: a blob a publish rewrote after the listing was modified past it and is refused, so it is
// Kept, which closes the race between a reuse and a delete without a lease
export const pruneGameData = async ({
  containerClient,
  isDryRun,
  liveHashes,
  now,
}: PruneGameDataOptions): Promise<GameDataPruneResult> => {
  const liveBlobNames = new Set(Array.from(liveHashes, getGameDataBlobName));
  const cutoff = new Date(now - GAME_DATA_RETENTION_MS);
  const listCandidateNames = async (prefix: string, checkIsLive: (name: string) => boolean) =>
    (await listBlobItems(containerClient, prefix))
      .filter(({ lastModified, name }) => !checkIsLive(name) && lastModified < cutoff)
      .map(({ name }) => name);
  const candidateNames = [
    ...(await listCandidateNames(`${GAME_DATA_BLOB_PATH}/`, (name) => liveBlobNames.has(name))),
    ...(await listCandidateNames(`${CHARACTER_PACK_BLOB_PATH}/`, (name) => {
      const [, packHash] = name.slice(CHARACTER_PACK_BLOB_PATH.length + 1).split("/");
      return packHash !== undefined && liveHashes.has(packHash);
    })),
  ];
  if (isDryRun) return { candidateCount: candidateNames.length, deletedCount: 0, keptCount: 0 };
  const keptNames = await deleteBlobs(containerClient, candidateNames, { ifUnmodifiedSince: cutoff });
  return {
    candidateCount: candidateNames.length,
    deletedCount: candidateNames.length - keptNames.length,
    keptCount: keptNames.length,
  };
};
