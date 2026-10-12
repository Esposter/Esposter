import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

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
  const blockOffsetFileMap = new Map<string, string>();
  for (const [file, { block, offset }] of cabMap)
    if (blocks.has(block)) blockOffsetFileMap.set(`${block}|${offset}`, file);
  return readIndexedNames(
    ({ block, pathId }) => blocks.has(block) && pathIds.has(pathId),
    ({ block, offset, pathId }) => {
      const file = blockOffsetFileMap.get(`${block}|${offset}`);
      return file ? toObjectKey(file, pathId) : undefined;
    },
  );
};
