import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Every dump of one type in one file of a block, which holds none of a type it has no object of
export const readAll = async <T>(directory: string): Promise<T[]> => {
  if (!existsSync(directory)) return [];
  const names = await readdir(directory);
  return Promise.all(
    names.map(async (name) => parseMachineJson<T>(await readFile(join(directory, name), "utf8"), reviveSourcePathId)),
  );
};
