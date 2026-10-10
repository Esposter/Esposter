import type { CabEntry } from "#src/models/genshinAssets/shared/CabEntry";
import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";

import { getOrCreate } from "@esposter/shared";

// The files depending on the file holding each asset, by the asset's name: the asset index gives an asset its file's
// Offset in its block, by which the CAB map names that file and every file listing it among its dependencies
export const getDependantFiles = (
  assets: readonly IndexedAsset[],
  cabMap: ReadonlyMap<string, CabEntry>,
): Map<string, CabEntry[]> => {
  const assetBlocks = new Set(assets.map(({ block }) => block));
  const blockOffsetCabMap = new Map<string, Map<number, string>>();
  for (const [cab, { block, offset }] of cabMap)
    if (assetBlocks.has(block)) getOrCreate(blockOffsetCabMap, block, () => new Map<number, string>()).set(offset, cab);
  const assetCabMap = new Map(
    assets.flatMap((asset) => {
      const cab = blockOffsetCabMap.get(asset.block)?.get(asset.offset);
      return cab ? [[asset, cab] as const] : [];
    }),
  );
  const assetCabs = new Set(assetCabMap.values());
  const cabDependantFilesMap = new Map<string, CabEntry[]>();
  for (const entry of cabMap.values())
    for (const dependency of entry.dependencies)
      if (assetCabs.has(dependency)) getOrCreate(cabDependantFilesMap, dependency, () => []).push(entry);
  const nameDependantFilesMap = new Map<string, Set<CabEntry>>();
  for (const [{ name }, cab] of assetCabMap)
    for (const entry of cabDependantFilesMap.get(cab) ?? [])
      getOrCreate(nameDependantFilesMap, name, () => new Set()).add(entry);
  return new Map(Array.from(nameDependantFilesMap, ([name, entries]) => [name, [...entries]]));
};
