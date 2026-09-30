import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { composeAssetPlacements } from "#src/services/genshinAssets/composeAssetPlacements";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { readComponentLayout } from "#src/services/genshinAssets/readComponentLayout";

// Where every object of a component stands, composed from its layout dumps with each spawned prefab under its anchor,
// Kept to the arrangements hanging from the roots its map names: one set of meshes is laid out several times across a
// Scene's blocks, and only some of those arrangements are the component's. Other roots can be named in their place, to
// Try another arrangement
export const readComponentPlacements = async (
  component: DerivedAssetComponent,
  roots: readonly string[] = DerivedAssetComponentMap[component].roots.map(({ name }) => name),
): Promise<AssetPlacement[]> => {
  const { gameObjectDrawingMap, objects } = await readComponentLayout(component);
  return composeAssetPlacements(objects, gameObjectDrawingMap).filter(({ root }) => roots.includes(root));
};
