import { GAME_DATA_MIRROR_SOURCE_URL } from "#scripts/gameData/mirror/constants";
import { downloadGameDataObject } from "#scripts/gameData/mirror/downloadGameDataObject";
import { CONTENT_CACHE_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";

// One object's JSON through the machine-wide content cache, downloaded from the dev account on a miss at the path its
// Dataset stores it under. The cache is keyed by hash, the name the publisher gave the compact JSON, so every checkout,
// Worktree and run on the machine shares one copy whatever dataset names it
export const readMirroredGameDataObject = async (
  dataset: string,
  hash: string,
  mirrorDirectory: string = CONTENT_CACHE_DIRECTORY,
): Promise<string> =>
  (
    await readContentAddressedObject(
      hash,
      () => downloadGameDataObject(`${GAME_DATA_MIRROR_SOURCE_URL}/${dataset}/${hash}.json`),
      mirrorDirectory,
    )
  ).toString("utf8");
