import { GAME_DATA_MIRROR_DIRECTORY, GAME_DATA_MIRROR_SOURCE_URL } from "#scripts/gameData/mirror/constants";
import { downloadGameDataObject } from "#scripts/gameData/mirror/downloadGameDataObject";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// One object's JSON from the mirror, downloaded from the dev account on a miss and kept only once its bytes hash to its
// Name, which is the compact JSON the publisher hashed. A worker that loses the race to write it has written the same
// Bytes, so its rename failing over the winner's file is still a hit
export const readMirroredGameDataObject = async (
  hash: string,
  mirrorDirectory: string = GAME_DATA_MIRROR_DIRECTORY,
): Promise<string> => {
  const path = join(mirrorDirectory, `${hash}.json`);
  if (existsSync(path)) return readFile(path, "utf8");
  const json = await downloadGameDataObject(`${GAME_DATA_MIRROR_SOURCE_URL}/${hash}.json`);
  if (createHash("sha256").update(json).digest("hex") !== hash)
    throw new InvalidOperationError(Operation.Read, hash, "does not hash to its name");
  await mkdir(mirrorDirectory, { recursive: true });
  const temporaryPath = `${path}.${crypto.randomUUID()}.part`;
  await writeFile(temporaryPath, json);
  await getResultAsync(() => rename(temporaryPath, path)).match(noop, async (error) => {
    await rm(temporaryPath, { force: true });
    if (!existsSync(path)) throw error;
  });
  return json;
};
