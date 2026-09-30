import type { IndexedAsset } from "#src/models/genshinAssets/IndexedAsset";

import { ASSET_INDEX_PATH } from "#src/services/genshinAssets/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// Every asset of the index the predicate keeps, read in one pass over its lines
export const readIndexedAssets = async (predicate: (asset: IndexedAsset) => boolean): Promise<IndexedAsset[]> => {
  if (!existsSync(ASSET_INDEX_PATH))
    throw new InvalidOperationError(Operation.Read, ASSET_INDEX_PATH, "no asset index: run `genshin:assets map` first");
  const assets: IndexedAsset[] = [];
  for (const line of (await readFile(ASSET_INDEX_PATH, "utf8")).split("\n")) {
    const [name = "", type = "", block = "", pathId = ""] = line.split("\t");
    const asset = { block, name, pathId, type };
    if (block && predicate(asset)) assets.push(asset);
  }
  return assets;
};
