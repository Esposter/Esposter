import { ASSET_INDEX_PATH } from "#src/services/genshinAssets/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The blocks holding every asset whose name matches, from the asset index, each relative to the blocks folder
export const readAssetBlocks = async (namePattern: string): Promise<string[]> => {
  if (!existsSync(ASSET_INDEX_PATH))
    throw new InvalidOperationError(Operation.Read, ASSET_INDEX_PATH, "no asset index: run `genshin:assets map` first");
  const pattern = new RegExp(namePattern, "u");
  const blocks = new Set<string>();
  for (const line of (await readFile(ASSET_INDEX_PATH, "utf8")).split("\n")) {
    const [name = "", , block = ""] = line.split("\t");
    if (block && pattern.test(name)) blocks.add(block);
  }
  return [...blocks].toSorted();
};
