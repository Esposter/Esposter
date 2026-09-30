import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { composeAssetPlacements } from "#src/services/genshinAssets/composeAssetPlacements";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readSceneLayout } from "#src/services/genshinAssets/readSceneLayout";

// Where every object of a component's blocks stands, composed from their layout dumps, kept to the arrangements hanging
// From the roots it names: one set of meshes is laid out several times across a scene's blocks, and only some of those
// Arrangements are the component's
export const readComponentPlacements = async (
  component: DerivedAssetComponent,
  roots: readonly string[],
): Promise<AssetPlacement[]> => {
  const { nameMeshMap, objects } = await readSceneLayout(getComponentDirectory(component).layout);
  return composeAssetPlacements(objects, nameMeshMap).filter(({ root }) => roots.includes(root));
};
