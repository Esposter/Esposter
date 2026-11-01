import { GAME_DATA_MIRROR_SOURCE_URL } from "#scripts/gameData/mirror/constants";
import { downloadGameDataObject } from "#scripts/gameData/mirror/downloadGameDataObject";
import { CONTENT_CACHE_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";

// One hosted file's bytes through the machine-wide content cache, downloaded from the dev account on a miss at the path
// The hosted game data holds it under. The cache is keyed by hash, the name the publisher gave the bytes, so every
// Checkout, worktree and run on the machine shares one copy whatever path names it
export const readMirroredGameDataFile = (
  sourcePath: string,
  hash: string,
  mirrorDirectory: string = CONTENT_CACHE_DIRECTORY,
): Promise<Buffer> =>
  readContentAddressedObject(
    hash,
    () => downloadGameDataObject(`${GAME_DATA_MIRROR_SOURCE_URL}/${sourcePath}`),
    mirrorDirectory,
  );
