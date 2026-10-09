import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";

import { ASSET_INDEX_PATH } from "#src/services/genshinAssets/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";

// One line of the index as its asset, or none for a line with no block, which no asset is listed under
export const parseIndexLine = (line: string): IndexedAsset | undefined => {
  const [name = "", type = "", block = "", pathId = ""] = line.split("\t");
  return block ? { block, name, pathId, type } : undefined;
};

// Every asset of the index at the path the predicate keeps, streamed a line at a time: the index is too large to read
// Whole, since a string holds at most about half a gigabyte, and only the kept rows are held
export const readIndexedAssetsFrom = async (
  indexPath: string,
  predicate: (asset: IndexedAsset) => boolean,
): Promise<IndexedAsset[]> => {
  if (!existsSync(indexPath))
    throw new InvalidOperationError(Operation.Read, indexPath, "no asset index: run `genshin:assets map` first");
  const assets: IndexedAsset[] = [];
  const lines = createInterface({ crlfDelay: Infinity, input: createReadStream(indexPath, "utf8") });
  for await (const line of lines) {
    const asset = parseIndexLine(line);
    if (asset && predicate(asset)) assets.push(asset);
  }
  return assets;
};

export const readIndexedAssets = (predicate: (asset: IndexedAsset) => boolean): Promise<IndexedAsset[]> =>
  readIndexedAssetsFrom(ASSET_INDEX_PATH, predicate);
