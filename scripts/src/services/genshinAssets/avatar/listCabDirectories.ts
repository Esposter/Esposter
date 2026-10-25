import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The folders of every CAB holding skinned renderer dumps, under each block of a layout
export const listCabDirectories = async (layoutDirectory: string): Promise<string[]> => {
  const typeDirectories = (await readdir(layoutDirectory)).map((block) =>
    join(layoutDirectory, block, AssetType.SkinnedMeshRenderer),
  );
  const cabLists = await Promise.all(
    typeDirectories.map(async (directory) =>
      existsSync(directory) ? (await readdir(directory)).map((file) => join(directory, file)) : [],
    ),
  );
  return cabLists.flat();
};
