import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { composeAssetPlacements } from "#src/services/genshinAssets/shared/composeAssetPlacements";
import { copySpawns } from "#src/services/genshinAssets/shared/copySpawns";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";
import { getWorldRoots } from "#src/services/genshinAssets/world/getWorldRoots";
import { placeWorldPrefabs } from "#src/services/genshinAssets/world/placeWorldPrefabs";
import { readWorldPlacements } from "#src/services/genshinAssets/world/readWorldPlacements";

// Where every object of a component stands, composed from its layout dumps with each spawned prefab under its anchor,
// Kept to the arrangements hanging from the roots its map names: one set of meshes is laid out several times across a
// Scene's blocks, and only some of those arrangements are the component's. Other roots can be named in their place, to
// Try another arrangement. Copied, every spawn's copies are laid out too, as the scene draws them while they scroll;
// Otherwise each prefab stands once, as its own data is fitted. A part of the open world's prefabs stand wherever the
// World sets them down, and are its roots beside the ones its map names
export const readComponentPlacements = async (
  component: DerivedAssetComponent,
  {
    isCopied = false,
    roots = [...DerivedAssetComponentMap[component].roots, ...getWorldRoots(DerivedAssetComponentMap[component])].map(
      ({ name }) => name,
    ),
  }: { isCopied?: boolean; roots?: readonly string[] } = {},
): Promise<AssetPlacement[]> => {
  const [{ gameObjectDrawingMap, objects }, worldPlacements] = await Promise.all([
    readComponentLayout(component),
    readWorldPlacements(component),
  ]);
  const spawned = isCopied ? copySpawns(objects, DerivedAssetComponentMap[component].spawns ?? []) : objects;
  const laidOut = placeWorldPrefabs(spawned, worldPlacements);
  return composeAssetPlacements(laidOut, gameObjectDrawingMap).filter(({ root }) => roots.includes(root));
};
