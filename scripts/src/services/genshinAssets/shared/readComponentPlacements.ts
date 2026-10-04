import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { composeAssetPlacements } from "#src/services/genshinAssets/shared/composeAssetPlacements";
import { copySpawns } from "#src/services/genshinAssets/shared/copySpawns";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";

// Where every object of a component stands, composed from its layout dumps with each spawned prefab under its anchor,
// Kept to the arrangements hanging from the roots its map names: one set of meshes is laid out several times across a
// Scene's blocks, and only some of those arrangements are the component's. Other roots can be named in their place, to
// Try another arrangement. Copied, every spawn's copies are laid out too, as the scene draws them while they scroll;
// Otherwise each prefab stands once, as its own data is fitted
export const readComponentPlacements = async (
  component: DerivedAssetComponent,
  {
    isCopied = false,
    roots = DerivedAssetComponentMap[component].roots.map(({ name }) => name),
  }: { isCopied?: boolean; roots?: readonly string[] } = {},
): Promise<AssetPlacement[]> => {
  const { gameObjectDrawingMap, objects } = await readComponentLayout(component);
  const laidOut = isCopied ? copySpawns(objects, DerivedAssetComponentMap[component].spawns ?? []) : objects;
  return composeAssetPlacements(laidOut, gameObjectDrawingMap).filter(({ root }) => roots.includes(root));
};
