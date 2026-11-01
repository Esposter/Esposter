import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { parseIndexLine } from "#src/services/recreation/animeStudio/parseIndexLine";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";

// Every asset of the index the predicate keeps, streamed a line at a time: the index is too large to read whole, since a
// String holds at most about half a gigabyte, and only the kept rows are held
export const readIndexedAssets = async (
  predicate: (asset: IndexedAsset) => boolean,
  options: Pick<AnimeStudioOptions, "indexCommand" | "indexPath">,
): Promise<IndexedAsset[]> => {
  const { indexCommand, indexPath } = options;
  if (!existsSync(indexPath))
    throw new InvalidOperationError(Operation.Read, indexPath, `no asset index: run \`${indexCommand}\` first`);
  const assets: IndexedAsset[] = [];
  const lines = createInterface({ crlfDelay: Infinity, input: createReadStream(indexPath, "utf8") });
  for await (const line of lines) {
    const asset = parseIndexLine(line, options);
    if (asset && predicate(asset)) assets.push(asset);
  }
  return assets;
};
