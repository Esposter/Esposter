import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { checkIsArchitectureName } from "#src/services/genshinAssets/world/checkIsArchitectureName";
import { getDependantFiles } from "#src/services/genshinAssets/world/getDependantFiles";
import { toFileKey } from "#src/services/genshinAssets/world/toFileKey";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { getOrCreate } from "@esposter/shared";

// The blocks the game object of each asset's name may stand in, by that name: the block indexing the asset and, for a
// Building's, the block of each file depending on the file holding it that the asset index lists no asset in. A
// Building's LOD level is a prefab file of its own depending on its mesh's, in a block that need not index anything of
// Its name. A file the index does list assets in (a MonoBehaviour, an animator) is a gadget or a scene drawing the mesh
// As a child, almost never the prefab, and those fill the largest blocks the game has. A prop's name keeps its own
// Blocks alone, its game object looked for in every block dumped where they hold none (`deriveCapitalWorld`)
export const readPrefabBlocks = async (
  assets: readonly IndexedAsset[],
  cabMap: ReadonlyMap<string, CabEntry>,
): Promise<Map<string, string[]>> => {
  const nameDependantFilesMap = getDependantFiles(
    assets.filter(({ name }) => checkIsArchitectureName(name)),
    cabMap,
  );
  const dependantFileKeys = new Set([...nameDependantFilesMap.values()].flat().map((file) => toFileKey(file)));
  const listedFileKeys = new Set(
    (await readIndexedAssets((asset) => dependantFileKeys.has(toFileKey(asset)), GENSHIN_ANIMESTUDIO_OPTIONS)).map(
      (asset) => toFileKey(asset),
    ),
  );
  const namePrefabBlocksMap = new Map<string, Set<string>>();
  for (const { block, name } of assets) {
    const prefabBlocks = getOrCreate(namePrefabBlocksMap, name, () => new Set()).add(block);
    for (const file of nameDependantFilesMap.get(name) ?? [])
      if (!listedFileKeys.has(toFileKey(file))) prefabBlocks.add(file.block);
  }
  return new Map(Array.from(namePrefabBlocksMap, ([name, prefabBlocks]) => [name, [...prefabBlocks]]));
};
