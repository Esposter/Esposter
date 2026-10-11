import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";

// One line of the index as its asset, or none for a line with no block, which no asset is listed under. A line with no
// File offset was written before the index held them, and throws until the index is written again
export const parseIndexLine = (
  line: string,
  { indexCommand, indexPath }: Pick<AnimeStudioOptions, "indexCommand" | "indexPath">,
): IndexedAsset | undefined => {
  const [name = "", type = "", block = "", pathId = "", offset = ""] = line.split("\t");
  if (!block) return undefined;
  if (!offset)
    throw new InvalidOperationError(
      Operation.Read,
      indexPath,
      `holds no file offsets: run \`${indexCommand} --index\` to write it again from the asset map`,
    );
  return { block, name, offset: Number(offset), pathId, type };
};

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
