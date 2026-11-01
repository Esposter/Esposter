import { readMirroredGameDataFile } from "#scripts/gameData/mirror/readMirroredGameDataFile";
import { CONTENT_CACHE_DIRECTORY } from "@esposter/shared-node/cache";

// One dataset object's JSON through the content cache, at the path its dataset stores it under
export const readMirroredGameDataObject = async (
  dataset: string,
  hash: string,
  mirrorDirectory: string = CONTENT_CACHE_DIRECTORY,
): Promise<string> =>
  (await readMirroredGameDataFile(`${dataset}/${hash}.json`, hash, mirrorDirectory)).toString("utf8");
