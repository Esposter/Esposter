import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { createBlockOffsetFileFinder } from "#src/services/genshinAssets/shared/createBlockOffsetFileFinder";
import { readIndexedNames } from "#src/services/genshinAssets/shared/readIndexedNames";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// The name of each object by its file and path ID, as the asset index names it. The index holds a file's offset in its
// Block rather than the file, so an indexed row is matched to its file through the CAB map's offset of each file
export const readObjectNames = (
  objects: readonly ResolvedObject[],
  cabMap: ReadonlyMap<string, CabEntry>,
): Promise<Map<string, string>> => {
  const blocks = new Set(objects.map(({ block }) => block));
  const pathIds = new Set(objects.map(({ pathId }) => pathId));
  const findFile = createBlockOffsetFileFinder(cabMap);
  return readIndexedNames(
    ({ block, pathId }) => blocks.has(block) && pathIds.has(pathId),
    ({ block, offset, pathId }) => {
      const file = findFile(block, offset);
      return file ? toObjectKey(file, pathId) : undefined;
    },
  );
};
