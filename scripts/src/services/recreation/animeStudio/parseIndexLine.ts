import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { InvalidOperationError, Operation } from "@esposter/shared";

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
