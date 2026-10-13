import { GAME_DATA_MIRROR_SOURCE_URL } from "#scripts/gameData/mirror/constants";
import { downloadGameDataObject } from "#scripts/gameData/mirror/downloadGameDataObject";
import { CONTENT_CACHE_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";

// One object's JSON through the machine-wide content cache, downloaded from the dev account on a miss. Its name is the
// Hash of the compact JSON the publisher wrote, so every checkout, worktree and run on the machine shares one copy
export const readMirroredGameDataObject = async (
  hash: string,
  mirrorDirectory: string = CONTENT_CACHE_DIRECTORY,
): Promise<string> =>
  (
    await readContentAddressedObject(
      hash,
      () => downloadGameDataObject(`${GAME_DATA_MIRROR_SOURCE_URL}/${hash}.json`),
      mirrorDirectory,
    )
  ).toString("utf8");
