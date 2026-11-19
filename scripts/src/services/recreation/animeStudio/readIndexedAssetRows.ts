import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { parseIndexLine } from "#src/services/recreation/animeStudio/parseIndexLine";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";

// Every asset of the index, streamed a line at a time. The index is too large to read whole (a String holds at most
// About half a gigabyte), so a search holds only the rows it keeps
export const readIndexedAssetRows = async function* (
  options: Pick<AnimeStudioOptions, "indexCommand" | "indexPath">,
): AsyncGenerator<IndexedAsset> {
  const { indexCommand, indexPath } = options;
  if (!existsSync(indexPath))
    throw new InvalidOperationError(Operation.Read, indexPath, `no asset index: run \`${indexCommand}\` first`);
  const lines = createInterface({ crlfDelay: Infinity, input: createReadStream(indexPath, "utf8") });
  for await (const line of lines) {
    const asset = parseIndexLine(line, options);
    if (asset) yield asset;
  }
};
